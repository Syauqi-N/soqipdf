'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import FileUploader from '@/components/FileUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import Card from '@/components/ui/Card';

export default function CompressPdfPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();
  const [resultFile, setResultFile] = useState<{ url: string; filename: string }>();
  const [compression, setCompression] = useState<'screen' | 'ebook' | 'printer' | 'prepress'>('ebook');

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
      formData.append('compression', compression);

      setProgress(30);
      setStatus('processing');
      setMessage('Compressing PDF...');

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Compression failed');
      }

      setProgress(100);
      setStatus('completed');
      setMessage('Compression completed!');
      setResultFile({ url: data.fileUrl, filename: data.filename });

    } catch (err) {
      setStatus('error');
      setMessage('Compression failed');
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
              Compress PDF
            </h1>
            <p className="text-gray-600 text-lg">
              Reduce PDF file size while maintaining quality
            </p>
          </div>

          <Card className="mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#004766] mb-4">Compression Level</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    value="screen"
                    checked={compression === 'screen'}
                    onChange={(e) => setCompression(e.target.value as 'screen')}
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Screen (72 DPI)</div>
                    <div className="text-sm text-gray-600">Smallest file size, suitable for screen viewing</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-[#00D9FF] rounded-lg bg-[#00D9FF]/5">
                  <input
                    type="radio"
                    value="ebook"
                    checked={compression === 'ebook'}
                    onChange={(e) => setCompression(e.target.value as 'ebook')}
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div>
                    <div className="font-medium text-gray-900">eBook (150 DPI) - Recommended</div>
                    <div className="text-sm text-gray-600">Best balance of quality and size</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    value="printer"
                    checked={compression === 'printer'}
                    onChange={(e) => setCompression(e.target.value as 'printer')}
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Printer (300 DPI)</div>
                    <div className="text-sm text-gray-600">High quality for printing</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    value="prepress"
                    checked={compression === 'prepress'}
                    onChange={(e) => setCompression(e.target.value as 'prepress')}
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Prepress (300 DPI)</div>
                    <div className="text-sm text-gray-600">Highest quality for professional printing</div>
                  </div>
                </label>
              </div>
            </div>

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
                Your compressed PDF is ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Download your compressed PDF below
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
                <span>Choose compression level based on your needs</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <span>Upload your PDF file</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <span>Wait for compression to complete</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <span>Download your compressed PDF</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
