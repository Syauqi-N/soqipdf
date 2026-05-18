'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import FileUploader from '@/components/FileUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import Card from '@/components/ui/Card';

export default function ImageToPdfPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();
  const [resultFile, setResultFile] = useState<{ url: string; filename: string }>();
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setStatus('uploading');
    setProgress(0);
    setMessage('Uploading images...');
    setError(undefined);
    setResultFile(undefined);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      formData.append('pageSize', pageSize);

      setProgress(30);
      setStatus('processing');
      setMessage('Converting images to PDF...');

      const response = await fetch('/api/convert/image-to-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Conversion failed');
      }

      setProgress(100);
      setStatus('completed');
      setMessage('Conversion completed!');
      setResultFile({ url: data.fileUrl, filename: data.filename });

    } catch (err) {
      setStatus('error');
      setMessage('Conversion failed');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#004766] mb-4">
              Image to PDF
            </h1>
            <p className="text-gray-600 text-lg">
              Convert JPG, PNG images to PDF documents
            </p>
          </div>

          <Card className="mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#004766] mb-4">Options</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Legal')}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D9FF] focus:border-transparent"
                  disabled={status === 'processing' || status === 'uploading'}
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>
            </div>

            <FileUploader
              accept=".jpg,.jpeg,.png"
              multiple={true}
              onUpload={handleUpload}
              disabled={status === 'processing' || status === 'uploading'}
            />
          </Card>

          {status !== 'idle' && (
            <div className="mb-8">
              <ProcessingStatus
                status={status}
                progress={progress}
                message={message}
                error={error}
              />
            </div>
          )}

          {status === 'completed' && resultFile && (
            <Card className="text-center">
              <h3 className="text-xl font-semibold text-[#004766] mb-4">
                Your PDF is ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Download your PDF document below
              </p>
              <DownloadButton
                fileUrl={resultFile.url}
                filename={resultFile.filename}
                onDownloadComplete={() => {
                  setStatus('idle');
                  setResultFile(undefined);
                }}
              />
            </Card>
          )}

          <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#004766] mb-4">How it works</h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <span>Upload one or more images (JPG, PNG)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <span>Choose page size (A4, Letter, or Legal)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <span>Click process and wait for conversion</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <span>Download your PDF document</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
