export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  path: string;
}

export interface ProcessingOptions {
  format?: 'jpg' | 'png';
  quality?: number;
  compression?: 'screen' | 'ebook' | 'printer' | 'prepress';
  pageSize?: 'A4' | 'Letter' | 'Legal';
  splitMethod?: 'range' | 'pages' | 'every';
  splitConfig?: {
    ranges?: string[];
    pages?: number[];
    everyN?: number;
  };
}

export interface ApiResponse {
  success: boolean;
  filename?: string;
  fileUrl?: string;
  fileSize?: number;
  expiresIn?: number;
  error?: string;
  details?: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient?: string;
}

export interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export interface ProcessingStatusProps {
  status: ProcessingStatus;
}

export interface DownloadButtonProps {
  fileUrl: string;
  filename: string;
  onDownloadComplete?: () => void;
}

export type ConversionType = 
  | 'pdf-to-image'
  | 'pdf-to-word'
  | 'image-to-pdf'
  | 'word-to-pdf'
  | 'merge'
  | 'split'
  | 'compress';

export interface TempFileInfo {
  sessionId: string;
  originalName: string;
  tempPath: string;
  createdAt: Date;
}
