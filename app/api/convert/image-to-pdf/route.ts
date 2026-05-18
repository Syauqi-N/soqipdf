import { NextRequest, NextResponse } from 'next/server';
import { parseFormData, cleanupUploadedFiles } from '@/lib/utils/fileHandler';
import { createSessionDir, saveTempFile, getSessionIdFromPath, getTempFilePath, deleteSessionDir } from '@/lib/utils/tempStorage';
import { validateImageFile } from '@/lib/utils/validation';
import { imageToPdf } from '@/lib/pdf/converter';
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

    const pageSize = (formData.fields.pageSize || 'A4') as 'A4' | 'Letter' | 'Legal';

    sessionDir = createSessionDir();
    const imagePaths: string[] = [];

    for (let i = 0; i < formData.files.length; i++) {
      const file = formData.files[i];
      
      const validation = validateImageFile({
        name: file.originalFilename || 'image.jpg',
        size: file.size,
        type: file.mimetype || 'image/jpeg'
      } as File);

      if (!validation.valid) {
        if (sessionDir) deleteSessionDir(sessionDir);
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      const fileBuffer = fs.readFileSync(file.filepath);
      const ext = file.originalFilename?.split('.').pop() || 'jpg';
      const savedPath = saveTempFile(sessionDir, `image_${i}.${ext}`, fileBuffer);
      imagePaths.push(savedPath);
    }

    const outputFilename = generateOutputFilename(
      formData.files[0].originalFilename || 'converted.pdf',
      'from_images',
      'pdf'
    );
    
    const outputPath = getTempFilePath(sessionDir, outputFilename);

    await imageToPdf(imagePaths, outputPath, pageSize);

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
    console.error('Image to PDF error:', error);
    
    if (formData) {
      cleanupUploadedFiles(formData.files);
    }
    
    if (sessionDir) {
      deleteSessionDir(sessionDir);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to convert images to PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
