import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-8 shadow-[0_4px_6px_-1px_rgba(0,71,102,0.1),0_2px_4px_-1px_rgba(0,71,102,0.06)]';
  const hoverStyles = hover 
    ? 'hover:shadow-[0_20px_25px_-5px_rgba(0,71,102,0.15),0_10px_10px_-5px_rgba(0,71,102,0.04)] hover:-translate-y-2 transition-all duration-300 cursor-pointer' 
    : '';
  
  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
