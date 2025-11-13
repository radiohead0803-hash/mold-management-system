import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {/* Circle with CAMS */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neutral-800 rounded-full flex items-center justify-center bg-white">
          <div className="bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
            AMS
          </div>
        </div>
      </div>
      
      {/* Company Name */}
      <div className="ml-3 flex flex-col">
        <span className={`font-bold text-neutral-800 leading-tight ${textSizes[size]}`}>
          주식회사
        </span>
        <span className={`font-bold text-neutral-800 leading-tight ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-3xl'}`}>
          캠스
        </span>
      </div>
    </div>
  );
};

export default Logo;
