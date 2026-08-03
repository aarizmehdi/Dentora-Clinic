import React from 'react';
import { useDentora } from '../../context/DentoraContext';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChartHistoryView: React.FC = () => {
  const { selectedPatient, toothConditions } = useDentora();

  if (!selectedPatient) return null;

  const patientConditions = toothConditions.filter(c => c.patientId === selectedPatient.id);

  // Upper arch teeth: 1 to 16
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  // Lower arch teeth: 32 down to 17
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  const renderToothCell = (toothNum: number) => {
    const toothConds = patientConditions.filter(c => c.toothNumber === toothNum);
    const isMissing = toothConds.some(c => c.conditionType === 'missing');
    const hasCrown = toothConds.some(c => c.conditionType === 'crown');
    const hasDecay = toothConds.some(c => c.conditionType === 'decay');
    const hasRCT = toothConds.some(c => c.conditionType === 'rct');
    const hasImplant = toothConds.some(c => c.conditionType === 'implant');

    return (
      <div
        key={toothNum}
        className={`relative flex flex-col items-center p-2 rounded-xl border select-none group ${
          toothConds.length > 0
            ? 'bg-white border-slate-300 shadow-sm'
            : 'bg-slate-50/70 border-slate-200'
        }`}
      >
        <span className="text-[11px] font-bold text-slate-700 font-mono mb-1">#{toothNum}</span>
        <div className="relative w-11 h-11 flex items-center justify-center">
          {isMissing ? (
            <div className="w-9 h-9 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-300 font-bold text-xs">
              ✕
            </div>
          ) : (
            <svg viewBox="0 0 100 100" className="w-10 h-10">
              <rect x="10" y="10" width="80" height="80" rx="16" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="4" />
              <polygon points="10,10 90,10 70,30 30,30" fill={toothConds.some(c => c.surfaces.includes('B') || c.surfaces.includes('L')) ? (hasDecay ? '#EF4444' : '#0D9488') : '#E2E8F0'} stroke="#64748B" strokeWidth="2" />
              <polygon points="90,10 90,90 70,70 70,30" fill={toothConds.some(c => c.surfaces.includes('D')) ? (hasDecay ? '#EF4444' : '#0D9488') : '#E2E8F0'} stroke="#64748B" strokeWidth="2" />
              <polygon points="10,90 90,90 70,70 30,70" fill={toothConds.some(c => c.surfaces.includes('F') || c.surfaces.includes('L')) ? (hasDecay ? '#EF4444' : '#0D9488') : '#E2E8F0'} stroke="#64748B" strokeWidth="2" />
              <polygon points="10,10 10,90 30,70 30,30" fill={toothConds.some(c => c.surfaces.includes('M')) ? (hasDecay ? '#EF4444' : '#0D9488') : '#E2E8F0'} stroke="#64748B" strokeWidth="2" />
              <rect x="30" y="30" width="40" height="40" rx="6" fill={toothConds.some(c => c.surfaces.includes('O') || c.surfaces.includes('I')) ? (hasDecay ? '#EF4444' : '#0D9488') : '#CBD5E1'} stroke="#475569" strokeWidth="2" />
              {hasCrown && <circle cx="50" cy="50" r="36" fill="none" stroke="#D97706" strokeWidth="6" strokeDasharray="6 4" />}
              {hasRCT && <line x1="50" y1="10" x2="50" y2="90" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" />}
              {hasImplant && <circle cx="50" cy="50" r="12" fill="#0284C7" />}
            </svg>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-0.5 justify-center min-h-[16px]">
          {toothConds.map((c, idx) => (
            <span
              key={idx}
              className={`w-2 h-2 rounded-full ${
                c.conditionType === 'decay' ? 'bg-rose-500' :
                c.conditionType === 'crown' ? 'bg-amber-500' :
                c.conditionType === 'rct' ? 'bg-purple-600' :
                c.conditionType === 'composite' ? 'bg-teal-600' :
                c.conditionType === 'implant' ? 'bg-sky-500' : 'bg-slate-400'
              }`}
              title={c.description}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Historical Odontogram</h2>
              <p className="text-[11px] text-slate-500">Read-only view of patient's dental chart.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Decay</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Composite</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Crown</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> RCT</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Maxillary Arch (Upper Right 1 → Upper Left 16)</span>
            <span className="text-[11px] text-teal-700">Upper Arch</span>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
            {upperTeeth.map(renderToothCell)}
          </div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-200 relative text-center">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Occlusal Midline Plane
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Mandibular Arch (Lower Right 32 ← Lower Left 17)</span>
            <span className="text-[11px] text-teal-700">Lower Arch</span>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
            {lowerTeeth.map(renderToothCell)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Tooth Chart History & Conditions ({patientConditions.length})
        </h3>
        {patientConditions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No conditions or procedures recorded for this chart.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {patientConditions.map(cond => (
              <div key={cond.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                    Tooth #{cond.toothNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{cond.description}</span>
                      <span className="font-mono text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-md">
                        Surfaces: {cond.surfaces.join('') || 'Full'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Date: {cond.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
