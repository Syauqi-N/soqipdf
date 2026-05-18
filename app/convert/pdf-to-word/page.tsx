'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import FileUploader from '@/components/FileUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import Card from '@/components/ui/Card';

export default function PdfToWordPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();
  const [resultFile, setResultFile] = useState<{ url: string; filename: string }>();

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setStatus('uploading');
    setProgress(0);
    setMessage('Uploading file...');
    setError(undefined);
    setResultFile(undefined);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      setProgress(30);
      setStatus('processing');
      setMessage('Converting PDF to Word...');

      const response = await fetch('/api/convert/pdf-to-word', {
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
              PDF to Word
            </h1>
            <p className="text-gray-600 text-lg">
              Convert your PDF documents to editable Word files (DOCX)
            </p>
          </div>

          <Card className="mb-8">
            <FileUploader
              accept=".pdf"
              multiple={false}
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
                Your Word document is ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Download your converted DOCX file below
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
                <span>Upload your PDF file (max 50MB)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <span>Wait for the conversion process to complete</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <span>Download your editable Word document</span>
              </li>
            </ol>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Conversion quality depends on the PDF structure. 
                Text-based PDFs work best. Scanned PDFs may require OCR processing.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
