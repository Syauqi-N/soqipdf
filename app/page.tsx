'use client';

import Link from 'next/link';
import { FileImage, FileText, Image, FileType, Merge, Split, Minimize2 } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const features = [
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to high-quality JPG or PNG images',
      icon: <FileImage className="w-8 h-8 text-white" />,
      href: '/convert/pdf-to-image'
    },
    {
      title: 'PDF to Word',
      description: 'Convert PDF documents to editable Word files',
      icon: <FileText className="w-8 h-8 text-white" />,
      href: '/convert/pdf-to-word'
    },
    {
      title: 'Image to PDF',
      description: 'Convert JPG, PNG images to PDF documents',
      icon: <Image className="w-8 h-8 text-white" />,
      href: '/convert/image-to-pdf'
    },
    {
      title: 'Word to PDF',
      description: 'Convert Word documents to PDF format',
      icon: <FileType className="w-8 h-8 text-white" />,
      href: '/convert/word-to-pdf'
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into one document',
      icon: <Merge className="w-8 h-8 text-white" />,
      href: '/merge'
    },
    {
      title: 'Split PDF',
      description: 'Split PDF into multiple files by page ranges',
      icon: <Split className="w-8 h-8 text-white" />,
      href: '/split'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: <Minimize2 className="w-8 h-8 text-white" />,
      href: '/compress'
    }
  ];

  return (
    <div className="min-h-screen bg-[#004766]">
      <Header />
      
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00D9FF] rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00D9FF] rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              PDF Tools yang Powerful & Gratis
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Convert, merge, split, dan compress PDF dengan mudah. 
              Semua proses aman dan cepat.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Mulai Sekarang →
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-[#F8FAFB]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#004766] mb-4">
              Semua Tools PDF yang Anda Butuhkan
            </h2>
            <p className="text-gray-600 text-lg">
              Pilih tool yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#004766] to-[#006B8F]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Kenapa Memilih SoqiPDF?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-white">
              <div className="w-16 h-16 bg-[#00D9FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aman & Private</h3>
              <p className="text-white/80">
                File Anda dihapus otomatis setelah 1 jam. Privasi terjamin.
              </p>
            </div>
            <div className="text-white">
              <div className="w-16 h-16 bg-[#00D9FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cepat & Mudah</h3>
              <p className="text-white/80">
                Proses file dalam hitungan detik. Tanpa registrasi.
              </p>
            </div>
            <div className="text-white">
              <div className="w-16 h-16 bg-[#00D9FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">💯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Gratis</h3>
              <p className="text-white/80">
                Semua fitur gratis tanpa batasan. Tidak ada biaya tersembunyi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
