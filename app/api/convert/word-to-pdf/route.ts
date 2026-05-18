import { NextRequest, NextResponse } from 'next/server';
import { parseFormData, cleanupUploadedFiles } from '@/lib/utils/fileHandler';
import { createSessionDir, saveTempFile, getSessionIdFromPath, getTempFilePath, deleteSessionDir } from '@/lib/utils/tempStorage';
import { validateWordFile } from '@/lib/utils/validation';
import { wordToPdf } from '@/lib/pdf/converter';
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
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const file = formData.files[0];

    const validation = validateWordFile({
      name: file.originalFilename || 'file.docx',
      size: file.size,
      type: file.mimetype || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } as File);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    sessionDir = createSessionDir();
    
    const fileBuffer = fs.readFileSync(file.filepath);
    const inputPath = saveTempFile(sessionDir, 'input.docx', fileBuffer);
    
    const outputFilename = generateOutputFilename(
      file.originalFilename || 'converted.pdf',
      'from_word',
      'pdf'
    );
    
    const outputPath = getTempFilePath(sessionDir, outputFilename);

    await wordToPdf(inputPath, outputPath);

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
    console.error('Word to PDF error:', error);
    
    if (formData) {
      cleanupUploadedFiles(formData.files);
    }
    
    if (sessionDir) {
      deleteSessionDir(sessionDir);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to convert Word to PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
