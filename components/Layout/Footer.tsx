import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#002D42] text-white/80 py-12 mt-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">SoqiPDF</h3>
            <p className="text-sm">
              PDF tools yang powerful dan gratis. Convert, merge, split, dan compress PDF dengan mudah.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/convert/pdf-to-image" className="hover:text-[#00D9FF] transition-colors">PDF to Image</Link></li>
              <li><Link href="/convert/pdf-to-word" className="hover:text-[#00D9FF] transition-colors">PDF to Word</Link></li>
              <li><Link href="/merge" className="hover:text-[#00D9FF] transition-colors">Merge PDF</Link></li>
              <li><Link href="/split" className="hover:text-[#00D9FF] transition-colors">Split PDF</Link></li>
              <li><Link href="/compress" className="hover:text-[#00D9FF] transition-colors">Compress PDF</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Info</h4>
            <p className="text-sm">
              Semua file diproses secara aman dan dihapus otomatis setelah 1 jam.
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 SoqiPDF. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
