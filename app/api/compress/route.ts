import { NextRequest, NextResponse } from 'next/server';
import { parseFormData, cleanupUploadedFiles } from '@/lib/utils/fileHandler';
import { createSessionDir, saveTempFile, getSessionIdFromPath, getTempFilePath, deleteSessionDir } from '@/lib/utils/tempStorage';
import { validatePdfFile } from '@/lib/utils/validation';
import { compressPdf, CompressionLevel } from '@/lib/pdf/compressor';
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
    const compressionLevel = (formData.fields.compression || 'ebook') as CompressionLevel;

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
    
    const outputFilename = generateOutputFilename(
      file.originalFilename || 'compressed.pdf',
      'compressed',
      'pdf'
    );
    
    const outputPath = getTempFilePath(sessionDir, outputFilename);

    const result = await compressPdf(inputPath, outputPath, compressionLevel);

    const sessionId = getSessionIdFromPath(sessionDir);
    const fileUrl = `/api/download/${sessionId}/${outputFilename}`;
    const fileSize = getFileSize(outputPath);

    cleanupUploadedFiles(formData.files);

    return NextResponse.json({
      success: true,
      filename: outputFilename,
      fileUrl,
      fileSize,
      expiresIn: 3600,
      compressionInfo: {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio
      }
    });

  } catch (error) {
    console.error('Compress PDF error:', error);
    
    if (formData) {
      cleanupUploadedFiles(formData.files);
    }
    
    if (sessionDir) {
      deleteSessionDir(sessionDir);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compress PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
