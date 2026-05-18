import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'tmp');
const TEMP_FILE_EXPIRY = 3600000; // 1 hour in milliseconds

export function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

export function createSessionDir(): string {
  ensureTempDir();
  const sessionId = uuidv4();
  const sessionDir = path.join(TEMP_DIR, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });
  return sessionDir;
}

export function getTempFilePath(sessionDir: string, filename: string): string {
  return path.join(sessionDir, filename);
}

export function saveTempFile(sessionDir: string, filename: string, buffer: Buffer): string {
  const filePath = getTempFilePath(sessionDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function readTempFile(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}

export function deleteTempFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function deleteSessionDir(sessionDir: string): void {
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }
}

export function cleanupExpiredFiles(): void {
  ensureTempDir();
  const now = Date.now();
  
  try {
    const sessions = fs.readdirSync(TEMP_DIR);
    
    for (const session of sessions) {
      const sessionPath = path.join(TEMP_DIR, session);
      const stats = fs.statSync(sessionPath);
      
      if (stats.isDirectory()) {
        const age = now - stats.mtimeMs;
        
        if (age > TEMP_FILE_EXPIRY) {
          deleteSessionDir(sessionPath);
          console.log(`Cleaned up expired session: ${session}`);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
}

export function getTempFileUrl(sessionId: string, filename: string): string {
  return `/api/download/${sessionId}/${filename}`;
}

export function getSessionIdFromPath(sessionDir: string): string {
  return path.basename(sessionDir);
}
