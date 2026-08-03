import React from 'react';
import { ToothSurface, ToothCondition } from '../../types/dental';

interface CustomOdontogramProps {
  selectedTooth: number | null;
  selectedSurfaces: ToothSurface[];
  onSelectTooth: (tooth: number) => void;
  onHoverTooth: (tooth: number | null, e: React.MouseEvent) => void;
  toothConditions: ToothCondition[];
  patientId: string;
}

export const CustomOdontogram: React.FC<CustomOdontogramProps> = ({
  selectedTooth,
  selectedSurfaces,
  onSelectTooth,
  onHoverTooth,
  toothConditions,
  patientId
}) => {
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  // Compact non-overlapping arch coordinates (reduced Y-spread for sleeker fit)
  const archOffsets: [number, number][] = [
    [-265, -80], // Tooth 1 / 32 (Molar 3)
    [-232, -68], // Tooth 2 / 31 (Molar 2)
    [-198, -56], // Tooth 3 / 30 (Molar 1)
    [-165, -45], // Tooth 4 / 29 (Premolar 2)
    [-134, -34], // Tooth 5 / 28 (Premolar 1)
    [-104, -24], // Tooth 6 / 27 (Canine)
    [-68,  -15], // Tooth 7 / 26 (Lateral Incisor)
    [-23,  -8],  // Tooth 8 / 25 (Central Incisor)
    [23,   -8],  // Tooth 9 / 24 (Central Incisor)
    [68,   -15], // Tooth 10 / 23 (Lateral Incisor)
    [104,  -24], // Tooth 11 / 22 (Canine)
    [134,  -34], // Tooth 12 / 21 (Premolar 1)
    [165,  -45], // Tooth 13 / 20 (Premolar 2)
    [198,  -56], // Tooth 14 / 19 (Molar 1)
    [232,  -68], // Tooth 15 / 18 (Molar 2)
    [265,  -80], // Tooth 16 / 17 (Molar 3)
  ];

  const getToothConditions = (num: number) => {
    return toothConditions.filter(c => c.toothNumber === num && c.patientId === patientId);
  };

  const getSurfaceColor = (num: number, surface: ToothSurface) => {
    const conditions = getToothConditions(num);

    // 1. Check recorded conditions for this specific surface
    const decayCond = conditions.find(c => (c.conditionType === 'decay' || c.conditionType === ('caries' as any)) && c.surfaces.includes(surface));
    if (decayCond) return 'fill-rose-500 stroke-rose-700';

    const compositeCond = conditions.find(c => c.conditionType === 'composite' && c.surfaces.includes(surface));
    if (compositeCond) return 'fill-teal-400 stroke-teal-700';

    // 2. Active selection feedback (currently toggled in Inspector)
    if (selectedTooth === num && selectedSurfaces.includes(surface)) {
      return 'fill-teal-300 stroke-teal-600';
    }

    return 'fill-slate-50 stroke-slate-400';
  };

  // Anatomical dimension and rounding profiles
  const getToothShape = (num: number) => {
    const isMolar = [1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(num);
    const isPremolar = [4, 5, 12, 13, 20, 21, 28, 29].includes(num);
    const isCanine = [6, 11, 22, 27].includes(num);
    
    if (isMolar) {
      return { width: 32, height: 32, rx: 8 };
    }
    if (isPremolar) {
      return { width: 26, height: 28, rx: 10 };
    }
    if (isCanine) {
      return { width: 24, height: 26, rx: 12 };
    }
    return { width: 22, height: 24, rx: 6 };
  };

  const renderToothSVG = (num: number, isUpper: boolean) => {
    const isSelected = selectedTooth === num;
    const conditions = getToothConditions(num);
    const isMissing = conditions.some(c => c.conditionType === 'missing');
    const hasCrown = conditions.some(c => c.conditionType === 'crown');
    const hasRCT = conditions.some(c => c.conditionType === 'rct');
    const shape = getToothShape(num);

    const strokeColor = isSelected ? 'stroke-teal-600' : 'stroke-slate-600';
    const strokeWidth = isSelected ? '3.5' : '2';

    const clipId = `clip-${num}`;

    return (
      <div 
        className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
          isSelected ? 'scale-125 z-30' : 'hover:scale-115 z-10'
        }`}
        onClick={() => onSelectTooth(num)}
        onMouseMove={(e) => onHoverTooth(num, e)}
        onMouseLeave={(e) => onHoverTooth(null, e)}
        style={{ width: `${shape.width + 6}px` }}
      >
        {isUpper && (
          <span className={`text-[10px] font-extrabold mb-1 select-none transition-colors ${
            isSelected ? 'text-teal-700 scale-110' : 'text-slate-600'
          }`}>
            {num}
          </span>
        )}
        
        <div className={`relative ${isMissing ? 'opacity-30 grayscale' : ''}`}>
          <svg 
            width={shape.width} 
            height={shape.height} 
            viewBox="0 0 100 100" 
            className={`transition-all ${isSelected ? 'drop-shadow-md' : 'drop-shadow-xs'}`}
          >
            <defs>
              <clipPath id={clipId}>
                <rect x="3" y="3" width="94" height="94" rx={shape.rx * 2} ry={shape.rx * 2} />
              </clipPath>
            </defs>

            {/* Base Tooth Fill */}
            <rect 
              x="3" y="3" width="94" height="94" 
              rx={shape.rx * 2} ry={shape.rx * 2} 
              className={isSelected ? 'fill-teal-50/90' : 'fill-white'} 
            />

            {/* 5-Surface Clinical Geometry */}
            <g clipPath={`url(#${clipId})`}>
              {/* Buccal / Lingual Top */}
              <polygon 
                points="0,0 100,0 72,28 28,28" 
                className={`${hasCrown ? 'fill-amber-300' : getSurfaceColor(num, isUpper ? 'B' : 'L')} hover:fill-teal-200 stroke-slate-500`} 
                strokeWidth="1.5" 
              />
              {/* Distal / Mesial Right */}
              <polygon 
                points="100,0 100,100 72,72 72,28" 
                className={`${hasCrown ? 'fill-amber-400' : getSurfaceColor(num, isUpper ? 'D' : 'M')} hover:fill-teal-200 stroke-slate-500`} 
                strokeWidth="1.5" 
              />
              {/* Lingual / Buccal Bottom */}
              <polygon 
                points="0,100 100,100 72,72 28,72" 
                className={`${hasCrown ? 'fill-amber-300' : getSurfaceColor(num, isUpper ? 'L' : 'B')} hover:fill-teal-200 stroke-slate-500`} 
                strokeWidth="1.5" 
              />
              {/* Mesial / Distal Left */}
              <polygon 
                points="0,0 0,100 28,72 28,28" 
                className={`${hasCrown ? 'fill-amber-400' : getSurfaceColor(num, isUpper ? 'M' : 'D')} hover:fill-teal-200 stroke-slate-500`} 
                strokeWidth="1.5" 
              />
              {/* Occlusal Center */}
              <rect 
                x="28" y="28" width="44" height="44" rx={shape.rx} 
                className={`${hasCrown ? 'fill-amber-200' : getSurfaceColor(num, 'O')} hover:fill-teal-200 stroke-slate-500`} 
                strokeWidth="1.5" 
              />
            </g>

            {/* Root Canal Treatment (RCT) Line */}
            {hasRCT && (
              <g stroke="#9333ea" strokeWidth="10" strokeLinecap="round">
                <line x1="50" y1="10" x2="50" y2="90" />
              </g>
            )}

            {/* Missing Tooth (X) */}
            {isMissing && (
              <g stroke="#0f172a" strokeWidth="10" strokeLinecap="round">
                <line x1="16" y1="16" x2="84" y2="84" />
                <line x1="84" y1="16" x2="16" y2="84" />
              </g>
            )}

            {/* Crisp Dark Outer Border */}
            <rect 
              x="3" y="3" width="94" height="94" 
              rx={shape.rx * 2} ry={shape.rx * 2} 
              fill="none" 
              className={strokeColor} 
              strokeWidth={strokeWidth} 
            />
          </svg>
        </div>

        {!isUpper && (
          <span className={`text-[10px] font-extrabold mt-1 select-none transition-colors ${
            isSelected ? 'text-teal-700 scale-110' : 'text-slate-600'
          }`}>
            {num}
          </span>
        )}
      </div>
    );
  };

  const renderArch = (teeth: number[], isUpper: boolean) => {
    return (
      <div className="relative w-full h-[120px]">
        {teeth.map((num, i) => {
          const [x, y] = archOffsets[i];
          const yPos = isUpper ? y : -y;

          return (
            <div 
              key={num} 
              className="absolute transition-all duration-300"
              style={{
                left: `calc(50% + ${x}px)`,
                top: isUpper ? `calc(100% + ${yPos - 15}px)` : `calc(0% + ${yPos + 15}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {renderToothSVG(num, isUpper)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-2">
      {/* Upper Maxillary Arch */}
      <div className="w-full flex justify-center">
        {renderArch(upperTeeth, true)}
      </div>
      
      {/* Occlusal Midline Axis */}
      <div className="w-[520px] h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent my-3 relative flex items-center justify-center">
        <span className="bg-slate-50 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2">Occlusal Line</span>
      </div>

      {/* Lower Mandibular Arch */}
      <div className="w-full flex justify-center">
        {renderArch(lowerTeeth, false)}
      </div>
    </div>
  );
};
