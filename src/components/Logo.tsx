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
        <div className="w-full h-full relative flex items-center justify-center rounded-[28%] bg-gradient-to-br from-[#022c22] via-[#043e2f] to-[#011410] shadow-2xl overflow-hidden border-2 border-amber-500/30 p-2.5">
          {/* Subtle background radial glow & arabesque grid */}
          <div className="absolute inset-0 bg-radial-[circle_at_center] from-emerald-500/10 to-transparent opacity-60"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(245,158,11,0.02)_1px,transparent_1px),linear-gradient(-45deg,rgba(245,158,11,0.02)_1px,transparent_1px)] bg-[size:12px_12px] opacity-40"></div>
          
          <div className="relative flex flex-col items-center justify-center text-amber-400">
            {/* Custom geometric Luxury Rub el Hizb with Mosque Dome & Crescent */}
            <svg 
              viewBox="0 0 120 120" 
              className="drop-shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
              style={{ width: containerSize * 0.8, height: containerSize * 0.8 }}
            >
              <defs>
                {/* Real Metallic Gold Gradient */}
                <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" /> {/* yellow-200 */}
                  <stop offset="20%" stopColor="#f59e0b" /> {/* amber-500 */}
                  <stop offset="45%" stopColor="#fbbf24" /> {/* amber-400 */}
                  <stop offset="60%" stopColor="#fef08a" /> {/* yellow-200 */}
                  <stop offset="80%" stopColor="#b45309" /> {/* amber-700 */}
                  <stop offset="100%" stopColor="#d97706" /> {/* amber-600 */}
                </linearGradient>
                
                {/* Soft glow for active elements */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                {/* Inner Emerald Gradient */}
                <linearGradient id="innerEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="100%" stopColor="#064e3b" />
                </linearGradient>
              </defs>
              
              {/* Overlapping squares to create the 8-pointed Islamic Star (Rub el Hizb) with fine golden lines */}
              <g stroke="url(#goldMetallic)" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.35">
                <rect x="30" y="30" width="60" height="60" rx="3" />
                <rect x="30" y="30" width="60" height="60" rx="3" transform="rotate(45 60 60)" />
              </g>

              {/* Bold outer star container */}
              <g stroke="url(#goldMetallic)" strokeWidth="2.5" strokeLinejoin="round" fill="url(#innerEmerald)">
                <rect x="34" y="34" width="52" height="52" rx="4" />
                <rect x="34" y="34" width="52" height="52" rx="4" transform="rotate(45 60 60)" />
              </g>

              {/* Glowing inner golden ring */}
              <circle cx="60" cy="60" r="24" fill="none" stroke="url(#goldMetallic)" strokeWidth="1" strokeDasharray="3 1.5" opacity="0.7" />
              <circle cx="60" cy="60" r="21" fill="none" stroke="url(#goldMetallic)" strokeWidth="1" opacity="0.4" />

              {/* Stylized Mosque Dome Path */}
              <path 
                d="M 46,75 C 46,62 50,56 60,52 C 70,56 74,62 74,75 Z" 
                fill="url(#goldMetallic)" 
                opacity="0.9"
              />
              
              {/* Dome Base / Mihrab Arch */}
              <path 
                d="M 44,75 L 76,75 L 76,77 L 44,77 Z" 
                fill="url(#goldMetallic)"
              />

              {/* Glowing Crescent of Faith rising above the dome */}
              <path 
                d="M 68,40 A 10,10 0 1,0 68,60 A 8.5,8.5 0 1,1 68,40 Z" 
                fill="url(#goldMetallic)" 
                filter="url(#goldGlow)"
              />
              
              {/* Shining Star of Certainty (Yaqeen) at the peak */}
              <g filter="url(#goldGlow)">
                <polygon 
                  points="60,32 61.5,35 64.5,35 62,37 63,40 60,38 57,40 58,37 55.5,35 58.5,35" 
                  fill="#fffde7" 
                />
              </g>
              
              {/* Decorative side minaret/star accents */}
              <circle cx="43" cy="55" r="1.5" fill="url(#goldMetallic)" />
              <circle cx="77" cy="55" r="1.5" fill="url(#goldMetallic)" />
            </svg>
            
            {/* Show text only if the logo is large enough */}
            {!isSmall && (
              <span className="font-serif font-black tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-amber-300 mt-1.5 animate-pulse" style={{ fontSize: Math.max(12, containerSize * 0.18) }}>
                {t('app_name')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
