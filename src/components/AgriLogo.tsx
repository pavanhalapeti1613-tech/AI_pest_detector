import React from 'react';

interface AgriLogoProps {
  className?: string;
  size?: number;
}

export const AgriLogo: React.FC<AgriLogoProps> = ({ className = 'w-10 h-10', size = 40 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="headerLeafGrad" x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="headerSproutGrad" x1="32" y1="20" x2="48" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="headerSoilGrad" x1="10" y1="50" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Rounded Badge Base */}
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#064e3b" stroke="#10b981" strokeWidth="2" />

      {/* Acoustic Sensing Rings (Left & Right) */}
      <path d="M14 26 C12 29.5 12 34.5 14 38" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />
      <path d="M50 26 C52 29.5 52 34.5 50 38" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85" />
      <path d="M10 21 C7 27 7 37 10 43" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M54 21 C57 27 57 37 54 43" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Crop Soil Line */}
      <path d="M18 51 Q32 47 46 51" stroke="url(#headerSoilGrad)" strokeWidth="3.5" strokeLinecap="round" />

      {/* Main Seedling Stem */}
      <path d="M32 48 C32 38 31 28 32 18" stroke="#ecfdf5" strokeWidth="2.5" strokeLinecap="round" />

      {/* Primary Foliage Leaf */}
      <path d="M32 36 C24 36 17 28 20 18 C28 17 32 25 32 36 Z" fill="url(#headerLeafGrad)" stroke="#ecfdf5" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M22 23 C26 26 29 29 32 31" stroke="#a7f3d0" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.9" />

      {/* Sprout Growth Leaf */}
      <path d="M32 30 C38 30 46 25 45 15 C37 14 33 21 32 30 Z" fill="url(#headerSproutGrad)" stroke="#ecfdf5" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M42 19 C39 22 36 25 32 26" stroke="#dcfce7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.9" />

      {/* AI Acoustic Beacon Dot */}
      <circle cx="32" cy="16" r="2.5" fill="#facc15" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
  );
};
