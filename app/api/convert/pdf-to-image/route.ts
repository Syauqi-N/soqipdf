import { NextRequest, NextResponse } from 'next/server';
import { parseFormData, cleanupUploadedFiles } from '@/lib/utils/fileHandler';
import { createSessionDir, saveTempFile, getSessionIdFromPath, deleteSessionDir } from '@/lib/utils/tempStorage';
import { validatePdfFile } from '@/lib/utils/validation';
import { pdfToImages, ImageFormat } from '@/lib/pdf/converter';
import { createZipFromFiles } from '@/lib/utils/fileHandler';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let sessionDir: string | null = null;
  let formData: Awaited<ReturnType<typeof parseFormData>> | null = null;

  try {
    formData = await parseFormData(request);
    
    if (!formData.files || formData.files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const file = formData.files[0];
    const format = (formData.fields.format || 'png') as ImageFormat;
    const quality = parseInt(formData.fields.quality || '90');

    const validation = validatePdfFile({
      name: file.originalFilename || 'file.pdf',
      size: file.size,
      type: file.mimetype || 'application/pdf'
    } as File);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    sessionDir = createSessionDir();
    
    const fileBuffer = fs.readFileSync(file.filepath);
    const inputPath = saveTempFile(sessionDir, 'input.pdf', fileBuffer);
    
    const imageFiles = await pdfToImages(inputPath, sessionDir, format, quality);

    if (imageFiles.length === 0) {
      if (sessionDir) deleteSessionDir(sessionDir);
      return NextResponse.json(
        { success: false, error: 'No images were generated from PDF' },
        { status: 400 }
      );
    }

    let finalFileUrl: string;
    let finalFilename: string;
    let finalFileSize: number;

    if (imageFiles.length === 1) {
      finalFilename = path.basename(imageFiles[0]);
      const sessionId = getSessionIdFromPath(sessionDir);
      finalFileUrl = `/api/download/${sessionId}/${finalFilename}`;
      finalFileSize = fs.statSync(imageFiles[0]).size;
    } else {
      const zipFilename = `images_${Date.now()}.zip`;
      const zipPath = path.join(sessionDir, zipFilename);
      
      await createZipFromFiles(imageFiles, zipPath);
      
      finalFilename = zipFilename;
      const sessionId = getSessionIdFromPath(sessionDir);
      finalFileUrl = `/api/download/${sessionId}/${finalFilename}`;
      finalFileSize = fs.statSync(zipPath).size;
    }

    cleanupUploadedFiles(formData.files);

    return NextResponse.json({
      success: true,
      filename: finalFilename,
      fileUrl: finalFileUrl,
      fileSize: finalFileSize,
      expiresIn: 3600,
      imagesCount: imageFiles.length
    });

  } catch (error) {
    console.error('PDF to Image error:', error);
    
    if (formData) {
      cleanupUploadedFiles(formData.files);
    }
    
    if (sessionDir) {
      deleteSessionDir(sessionDir);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to convert PDF to images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
