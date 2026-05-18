import React, { useState, useRef } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';

interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUploader({
  accept,
  multiple = false,
  maxSize = 50 * 1024 * 1024,
  onUpload,
  disabled = false
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${isDragging ? 'border-[#00D9FF] bg-[#00D9FF]/5' : 'border-[#00D9FF]/30 bg-[#F8FAFB]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00D9FF] hover:bg-[#00D9FF]/5'}
        `}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-[#00D9FF] to-[#00B8D9] rounded-full flex items-center justify-center mx-auto mb-6">
          <Upload className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Drop your files here
        </h3>
        <p className="text-gray-500 mb-4">
          or click to browse
        </p>
        <p className="text-sm text-gray-400">
          Maximum file size: {maxSize / 1024 / 1024}MB
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <FileIcon className="w-8 h-8 text-[#00D9FF]" />
                <div>
                  <p className="font-medium text-[#1A1A1A]">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          <button
            onClick={handleUploadClick}
            disabled={disabled || files.length === 0}
            className="w-full bg-gradient-to-r from-[#00D9FF] to-[#00B8D9] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process {files.length} {files.length === 1 ? 'File' : 'Files'}
          </button>
        </div>
      )}
    </div>
  );
}
