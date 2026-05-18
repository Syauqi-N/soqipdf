import { NextRequest, NextResponse } from 'next/server';
import { parseFormData, cleanupUploadedFiles } from '@/lib/utils/fileHandler';
import { createSessionDir, saveTempFile, getSessionIdFromPath, getTempFilePath, deleteSessionDir } from '@/lib/utils/tempStorage';
import { validatePdfFile } from '@/lib/utils/validation';
import { mergePdfs } from '@/lib/pdf/merger';
import { generateOutputFilename, getFileSize } from '@/lib/utils/fileHandler';
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
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    if (formData.files.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 PDF files are required for merging' },
        { status: 400 }
      );
    }

    sessionDir = createSessionDir();
    const pdfPaths: string[] = [];

    for (let i = 0; i < formData.files.length; i++) {
      const file = formData.files[i];
      
      const validation = validatePdfFile({
        name: file.originalFilename || 'file.pdf',
        size: file.size,
        type: file.mimetype || 'application/pdf'
      } as File);

      if (!validation.valid) {
        if (sessionDir) deleteSessionDir(sessionDir);
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const savedPath = saveTempFile(sessionDir, `input_${i}.pdf`, fileBuffer);
      pdfPaths.push(savedPath);
    }

    const mergedPdfBuffer = await mergePdfs(pdfPaths);
    
    const outputFilename = generateOutputFilename(
      formData.files[0].originalFilename || 'merged.pdf',
      'merged',
      'pdf'
    );
    
    const outputPath = getTempFilePath(sessionDir, outputFilename);
    fs.writeFileSync(outputPath, mergedPdfBuffer);

    const sessionId = getSessionIdFromPath(sessionDir);
    const fileUrl = `/api/download/${sessionId}/${outputFilename}`;
    const fileSize = getFileSize(outputPath);

    cleanupUploadedFiles(formData.files);

    return NextResponse.json({
      success: true,
      filename: outputFilename,
      fileUrl,
      fileSize,
      expiresIn: 3600
    });

  } catch (error) {
    console.error('Merge PDF error:', error);
    
    if (formData) {
      cleanupUploadedFiles(formData.files);
    }
    
    if (sessionDir) {
      deleteSessionDir(sessionDir);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to merge PDFs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
