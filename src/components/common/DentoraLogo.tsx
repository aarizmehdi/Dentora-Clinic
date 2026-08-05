import React, { useId } from 'react';

export const DentoraLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const rawId = useId();
  const safeId = rawId.replace(/:/g, '_');
  const bgId = `dentora_bg_${safeId}`;
  const gradId = `dentora_grad_${safeId}`;

  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className}`}>
      {/* Background rounded square */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#${bgId})`} />
      {/* Outer D shape */}
      <path d="M10 8H22C28.6274 8 34 13.3726 34 20C34 26.6274 28.6274 32 22 32H10V8Z" fill={`url(#${gradId})`} />
      {/* Inner D cutout - always white for contrast against gradient */}
      <path d="M16 14H22C25.3137 14 28 16.6863 28 20C28 23.3137 25.3137 26 22 26H16V14Z" fill="white" />
      <defs>
        <linearGradient id={bgId} x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D3D3B" />
          <stop offset="1" stopColor="#134E4A" />
        </linearGradient>
        <linearGradient id={gradId} x1="10" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
    </svg>
  );
};
