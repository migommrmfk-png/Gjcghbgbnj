import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Logo({ className = "w-24 h-24" }: { className?: string }) {
  const [imgError, setImgError] = React.useState(false);
  const { t } = useTranslation();

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
          alt={t('app_name')} 
          className="w-full h-full object-contain drop-shadow-md" 
          onError={() => setImgError(true)} 
        />
      ) : (
        <div className="w-full h-full relative flex items-center justify-center rounded-[25%] bg-gradient-to-br from-[#0a2f24] to-[#041d15] shadow-xl overflow-hidden border border-[#eab308]/20 p-2">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay"></div>
          
          <div className="relative flex flex-col items-center justify-center text-[#eab308]">
            {/* Custom geometric Rub el Hizb with Crescent and Star */}
            <svg 
              viewBox="0 0 100 100" 
              className="drop-shadow-[0_0_12px_rgba(234,179,8,0.3)]"
              style={{ width: containerSize * 0.75, height: containerSize * 0.75 }}
            >
              <defs>
                <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
              </defs>
              
              {/* Overlapping squares to create the 8-pointed Islamic Star (Rub el Hizb) */}
              <g stroke="#eab308" strokeWidth="2.5" strokeLinejoin="round">
                <rect x="25" y="25" width="50" height="50" fill="url(#bubbleGrad)" rx="6" />
                <rect x="25" y="25" width="50" height="50" fill="url(#bubbleGrad)" rx="6" transform="rotate(45 50 50)" />
              </g>

              {/* Inner golden ring for depth */}
              <circle cx="50" cy="50" r="18" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 2" />

              {/* Gold Crescent */}
              <path 
                d="M56,38 A12,12 0 1,0 56,62 A10,10 0 1,1 56,38 Z" 
                fill="#eab308" 
              />
              
              {/* Gold Star */}
              <polygon 
                points="62,44 63.5,47.5 67,48 64.5,50.5 65.5,54 62,52 58.5,54 59.5,50.5 57,48 60.5,47.5" 
                fill="#eab308" 
              />
            </svg>
            
            {/* Show text only if the logo is large enough */}
            {!isSmall && (
              <span className="font-extrabold font-serif tracking-widest drop-shadow-md text-amber-400 mt-1" style={{ fontSize: Math.max(11, containerSize * 0.16) }}>
                {t('app_name')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
