import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export type CompressionLevel = 'screen' | 'ebook' | 'printer' | 'prepress';

const COMPRESSION_SETTINGS = {
  screen: '/screen',    // 72 DPI - smallest file
  ebook: '/ebook',      // 150 DPI - recommended
  printer: '/printer',  // 300 DPI
  prepress: '/prepress' // 300 DPI - highest quality
};

export async function compressPdf(
  inputPath: string,
  outputPath: string,
  level: CompressionLevel = 'ebook'
): Promise<{ originalSize: number; compressedSize: number; compressionRatio: number }> {
  const gsPath = process.env.GHOSTSCRIPT_PATH || 'gs';
  const setting = COMPRESSION_SETTINGS[level];

  const command = `${gsPath} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${setting} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

  try {
    await execAsync(command);

    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100
    };
  } catch (error) {
    throw new Error(`Failed to compress PDF: ${error}`);
  }
}

export async function checkGhostscriptInstalled(): Promise<boolean> {
  const gsPath = process.env.GHOSTSCRIPT_PATH || 'gs';
  
  try {
    await execAsync(`${gsPath} --version`);
    return true;
  } catch (error) {
    return false;
  }
}

export function getCompressionLevelDescription(level: CompressionLevel): string {
  const descriptions = {
    screen: '72 DPI - Smallest file size, suitable for screen viewing',
    ebook: '150 DPI - Recommended balance of quality and size',
    printer: '300 DPI - High quality for printing',
    prepress: '300 DPI - Highest quality for professional printing'
  };
  
  return descriptions[level];
}
