'use client';

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import FileUploader from '@/components/FileUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import DownloadButton from '@/components/DownloadButton';
import Card from '@/components/ui/Card';

export default function SplitPdfPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string>();
  const [resultFile, setResultFile] = useState<{ url: string; filename: string }>();
  const [splitMethod, setSplitMethod] = useState<'every' | 'range' | 'pages'>('every');
  const [everyN, setEveryN] = useState(1);
  const [ranges, setRanges] = useState('1-5, 6-10');
  const [pages, setPages] = useState('1, 3, 5');

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
      formData.append('method', splitMethod);

      if (splitMethod === 'every') {
        formData.append('everyN', everyN.toString());
      } else if (splitMethod === 'range') {
        const rangeArray = ranges.split(',').map(r => r.trim());
        formData.append('ranges', JSON.stringify(rangeArray));
      } else if (splitMethod === 'pages') {
        const pageArray = pages.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        formData.append('pages', JSON.stringify(pageArray));
      }

      setProgress(30);
      setStatus('processing');
      setMessage('Splitting PDF...');

      const response = await fetch('/api/split', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Split failed');
      }

      setProgress(100);
      setStatus('completed');
      setMessage('Split completed!');
      setResultFile({ url: data.fileUrl, filename: data.filename });

    } catch (err) {
      setStatus('error');
      setMessage('Split failed');
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
              Split PDF
            </h1>
            <p className="text-gray-600 text-lg">
              Split PDF into multiple files by page ranges
            </p>
          </div>

          <Card className="mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#004766] mb-4">Split Method</h3>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="every"
                    checked={splitMethod === 'every'}
                    onChange={(e) => setSplitMethod(e.target.value as 'every')}
                    className="mt-1"
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div className="flex-grow">
                    <div className="font-medium text-gray-900">Split every N pages</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <input
                        type="number"
                        min="1"
                        value={everyN}
                        onChange={(e) => setEveryN(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded"
                        disabled={splitMethod !== 'every' || status === 'processing' || status === 'uploading'}
                      />
                      <span className="ml-2">pages per file</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="range"
                    checked={splitMethod === 'range'}
                    onChange={(e) => setSplitMethod(e.target.value as 'range')}
                    className="mt-1"
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div className="flex-grow">
                    <div className="font-medium text-gray-900">Split by page ranges</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <input
                        type="text"
                        value={ranges}
                        onChange={(e) => setRanges(e.target.value)}
                        placeholder="e.g., 1-5, 6-10, 11-15"
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                        disabled={splitMethod !== 'range' || status === 'processing' || status === 'uploading'}
                      />
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="pages"
                    checked={splitMethod === 'pages'}
                    onChange={(e) => setSplitMethod(e.target.value as 'pages')}
                    className="mt-1"
                    disabled={status === 'processing' || status === 'uploading'}
                  />
                  <div className="flex-grow">
                    <div className="font-medium text-gray-900">Extract specific pages</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <input
                        type="text"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        placeholder="e.g., 1, 3, 5, 7"
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                        disabled={splitMethod !== 'pages' || status === 'processing' || status === 'uploading'}
                      />
                    </div>
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
                Your split PDFs are ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Download your files below (ZIP archive)
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
                <span>Choose your split method</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <span>Upload your PDF file</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <span>Wait for processing</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00D9FF] text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <span>Download ZIP file containing all split PDFs</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
