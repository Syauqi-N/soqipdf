import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Card from './ui/Card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export default function FeatureCard({ title, description, icon, href }: FeatureCardProps) {
  return (
    <Link href={href}>
      <Card hover className="h-full">
        <div className="flex flex-col h-full">
          <div className="w-16 h-16 bg-gradient-to-r from-[#00D9FF] to-[#00B8D9] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-6 flex-grow">
            {description}
          </p>
          
          <div className="flex items-center text-[#00D9FF] font-medium group-hover:translate-x-2 transition-transform">
            <span>Convert now</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
