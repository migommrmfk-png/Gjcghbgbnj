import React from 'react';
import { Moon, Star } from 'lucide-react';

export default function Logo({ className = "w-24 h-24" }: { className?: string }) {
  const [imgError, setImgError] = React.useState(false);

  // Extract pixel size roughly from Tailwind class
  const getApproxSize = (cls: string) => {
    const match = cls.match(/w-(\d+)/);
    if (match) {
      return parseInt(match[1]) * 4; // w-24 -> 24*4 = 96px roughly
    }
    if (cls.includes('w-full') || cls.includes('w-48') || cls.includes('w-40')) return 120;
    return 60; // fallback
  };

  const containerSize = getApproxSize(className);
  const isSmall = containerSize < 50;

  // If Logo.png is uploaded to the 'public' folder by the user, we try to load it.
  // Otherwise, we fallback to a beautiful minimal CSS/SVG icon.
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {!imgError ? (
        <img 
          src="/Logo.png" 
          alt="اليقين" 
          className="w-full h-full object-contain drop-shadow-md" 
          onError={() => setImgError(true)} 
        />
      ) : (
        <div className="w-full h-full relative flex items-center justify-center rounded-[25%] bg-gradient-to-br from-[#16334F] to-[#0D2235] shadow-xl overflow-hidden border border-[#C6A45F]/30 p-2">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-[#C6A45F]/5 mix-blend-overlay"></div>
          
          <div className="relative flex flex-col items-center justify-center text-[#C6A45F]">
            <div className="relative mb-1 flex items-center justify-center">
              <Moon size={Math.max(20, containerSize * 0.4)} strokeWidth={1.5} className="drop-shadow-[0_0_8px_rgba(198,164,95,0.5)] fill-current" />
              <Star size={Math.max(8, containerSize * 0.15)} className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/4 drop-shadow-[0_0_8px_rgba(198,164,95,0.8)] fill-current" />
            </div>
            
            {/* Show text only if the logo is large enough */}
            {!isSmall && (
              <span className="font-bold font-serif tracking-widest drop-shadow-md" style={{ fontSize: Math.max(12, containerSize * 0.2) }}>يقين</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
