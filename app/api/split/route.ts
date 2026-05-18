import { NextRequest, NextResponse } from 'next/server';
import { parseFormData, cleanupUploadedFiles } from '@/lib/utils/fileHandler';
import { createSessionDir, saveTempFile, getSessionIdFromPath, deleteSessionDir } from '@/lib/utils/tempStorage';
import { validatePdfFile } from '@/lib/utils/validation';
import { splitPdf, SplitConfig } from '@/lib/pdf/splitter';
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

    const splitMethod = formData.fields.method || 'every';
    const splitConfig: SplitConfig = {
      method: splitMethod as 'range' | 'pages' | 'every'
    };

    if (splitMethod === 'range' && formData.fields.ranges) {
      splitConfig.ranges = JSON.parse(formData.fields.ranges);
    } else if (splitMethod === 'pages' && formData.fields.pages) {
      splitConfig.pages = JSON.parse(formData.fields.pages);
    } else if (splitMethod === 'every' && formData.fields.everyN) {
      splitConfig.everyN = parseInt(formData.fields.everyN);
    } else {
      splitConfig.everyN = 1;
    }

    sessionDir = createSessionDir();
    
    const fileBuffer = fs.readFileSync(file.filepath);
    const inputPath = saveTempFile(sessionDir, 'input.pdf', fileBuffer);
    
    const outputFiles = await splitPdf(inputPath, sessionDir, splitConfig);

    if (outputFiles.length === 0) {
      if (sessionDir) deleteSessionDir(sessionDir);
      return NextResponse.json(
        { success: false, error: 'No files were generated from split operation' },
        { status: 400 }
      );
    }

    let finalFileUrl: string;
    let finalFilename: string;
    let finalFileSize: number;

    if (outputFiles.length === 1) {
      finalFilename = path.basename(outputFiles[0]);
      const sessionId = getSessionIdFromPath(sessionDir);
      finalFileUrl = `/api/download/${sessionId}/${finalFilename}`;
      finalFileSize = fs.statSync(outputFiles[0]).size;
    } else {
      const zipFilename = `split_${Date.now()}.zip`;
      const zipPath = path.join(sessionDir, zipFilename);
      
      await createZipFromFiles(outputFiles, zipPath);
      
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
      filesCount: outputFiles.length
    });

  } catch (error) {
    console.error('Split PDF error:', error);
    
    if (formData) {
      cleanupUploadedFiles(formData.files);
    }
    
    if (sessionDir) {
      deleteSessionDir(sessionDir);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to split PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
