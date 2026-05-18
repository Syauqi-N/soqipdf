import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sanitizeFilename } from './validation';
import * as archiverLib from 'archiver';
const { ZipArchive } = archiverLib;

export interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export interface ParsedFormData {
  files: UploadedFile[];
  fields: { [key: string]: string };
}

export async function parseFormData(req: NextRequest): Promise<ParsedFormData> {
  const formData = await req.formData();
  
  const files: UploadedFile[] = [];
  const fields: { [key: string]: string } = {};
  
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const tempPath = path.join('/tmp', `upload_${Date.now()}_${value.name}`);
      fs.writeFileSync(tempPath, buffer);
      
      files.push({
        filepath: tempPath,
        originalFilename: value.name,
        mimetype: value.type,
        size: value.size
      });
    } else {
      fields[key] = value;
    }
  }
  
  return { files, fields };
}

export function moveFile(sourcePath: string, destPath: string): void {
  fs.copyFileSync(sourcePath, destPath);
  fs.unlinkSync(sourcePath);
}

export function copyFile(sourcePath: string, destPath: string): void {
  fs.copyFileSync(sourcePath, destPath);
}

export function getFileSize(filePath: string): number {
  return fs.statSync(filePath).size;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function generateOutputFilename(
  originalFilename: string,
  operation: string,
  extension: string
): string {
  const baseName = path.parse(originalFilename).name;
  const sanitized = sanitizeFilename(baseName);
  const timestamp = Date.now();
  return `${sanitized}_${operation}_${timestamp}.${extension}`;
}

export function createZipFromFiles(
  files: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => resolve());
    output.on('error', (err: Error) => reject(err));
    archive.on('error', (err: Error) => reject(err));

    archive.pipe(output);

    files.forEach((filePath) => {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: fileName });
    });

    archive.finalize();
  });
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function cleanupUploadedFiles(files: UploadedFile[]): void {
  files.forEach(file => {
    try {
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    } catch (error) {
      console.error(`Failed to cleanup uploaded file: ${file.filepath}`, error);
    }
  });
}
