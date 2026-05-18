const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_MIME_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/jpg', 'image/png'],
  word: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
};

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size <= maxSize;
}

export function validateTotalSize(files: File[], maxSize: number = MAX_TOTAL_SIZE): boolean {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  return totalSize <= maxSize;
}

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ALLOWED_MIME_TYPES.pdf)) {
    return { valid: false, error: 'File must be a PDF' };
  }
  
  if (!validateFileSize(file)) {
    return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  return { valid: true };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ALLOWED_MIME_TYPES.image)) {
    return { valid: false, error: 'File must be a JPG or PNG image' };
  }
  
  if (!validateFileSize(file)) {
    return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  return { valid: true };
}

export function validateWordFile(file: File): { valid: boolean; error?: string } {
  if (!validateFileType(file, ALLOWED_MIME_TYPES.word)) {
    return { valid: false, error: 'File must be a Word document (DOCX)' };
  }
  
  if (!validateFileSize(file)) {
    return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
