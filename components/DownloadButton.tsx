import React from 'react';
import { Download } from 'lucide-react';
import Button from './ui/Button';

interface DownloadButtonProps {
  fileUrl: string;
  filename: string;
  onDownloadComplete?: () => void;
}

export default function DownloadButton({ 
  fileUrl, 
  filename, 
  onDownloadComplete 
}: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Button 
      variant="primary" 
      size="lg" 
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <Download className="w-5 h-5" />
      Download {filename}
    </Button>
  );
}
