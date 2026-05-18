import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#004766]/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/soqipdf.png" 
              alt="SoqiPDF Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-white">SoqiPDF</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/convert/pdf-to-image" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Convert
            </Link>
            <Link href="/merge" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Merge
            </Link>
            <Link href="/split" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Split
            </Link>
            <Link href="/compress" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Compress
            </Link>
          </nav>
          
          <Link 
            href="/" 
            className="bg-gradient-to-r from-[#00D9FF] to-[#00B8D9] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
