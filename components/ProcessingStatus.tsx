import React from 'react';
import { Loader2, CheckCircle, XCircle, Upload } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export default function ProcessingStatus({ 
  status, 
  progress, 
  message, 
  error 
}: ProcessingStatusProps) {
  const getIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-8 h-8 text-[#00D9FF] animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-[#10B981]" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-[#EF4444]" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'text-[#00D9FF]';
      case 'completed':
        return 'text-[#10B981]';
      case 'error':
        return 'text-[#EF4444]';
      default:
        return 'text-gray-600';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,71,102,0.1),0_2px_4px_-1px_rgba(0,71,102,0.06)]">
      <div className="flex items-center gap-4 mb-4">
        {getIcon()}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-2">
            <span className={`font-semibold ${getStatusColor()}`}>
              {message}
            </span>
            {(status === 'uploading' || status === 'processing') && (
              <span className="text-[#00D9FF] font-semibold">{progress}%</span>
            )}
          </div>
          
          {(status === 'uploading' || status === 'processing') && (
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00D9FF] to-[#00B8D9] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
