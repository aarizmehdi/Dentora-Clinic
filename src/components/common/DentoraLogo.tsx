import React from 'react';

export const DentoraLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`drop-shadow-md ${className}`}>
    <path d="M10 8H22C28.6274 8 34 13.3726 34 20C34 26.6274 28.6274 32 22 32H10V8Z" fill="url(#paint0_linear)" />
    <path d="M16 14H22C25.3137 14 28 16.6863 28 20C28 23.3137 25.3137 26 22 26H16V14Z" fill="white" />
    <defs>
      <linearGradient id="paint0_linear" x1="10" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F766E" />
        <stop offset="1" stopColor="#2DD4BF" />
      </linearGradient>
    </defs>
  </svg>
);
