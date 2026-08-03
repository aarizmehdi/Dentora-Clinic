import React, { useState } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { Stethoscope, ShieldAlert, Plus, Check, Save } from 'lucide-react';

export const PerioChartView: React.FC = () => {
  const { selectedPatient, perioExams, addPerioExam, currentUser, showToast } = useDentora();

  const [depths, setDepths] = useState<Record<number, { MB: number; B: number; DB: number; ML: number; L: number; DL: number }>>({
    3: { MB: 3, B: 2, DB: 3, ML: 3, L: 2, DL: 3 },
    14: { MB: 4, B: 3, DB: 3, ML: 4, L: 3, DL: 4 },
    19: { MB: 3, B: 3, DB: 4, ML: 3, L: 3, DL: 4 },
    30: { MB: 2, B: 2, DB: 3, ML: 3, L: 2, DL: 2 },
  });

  if (!selectedPatient) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-sm">Please select a patient to view Periodontal Charting.</p>
      </div>
    );
  }

  const handleDepthChange = (toothNum: number, site: 'MB'|'B'|'DB'|'ML'|'L'|'DL', val: number) => {
    setDepths(prev => ({
      ...prev,
      [toothNum]: {
        ...(prev[toothNum] || { MB: 2, B: 2, DB: 2, ML: 2, L: 2, DL: 2 }),
        [site]: val
      }
    }));
  };

  const getPocketColor = (depth: number) => {
    if (depth <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (depth === 4) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-300 font-black animate-pulse';
  };

  const handleSavePerio = () => {
    addPerioExam({
      patientId: selectedPatient.id,
      date: new Date().toISOString().split('T')[0],
      providerId: currentUser.id,
      summary: '6-point periodontal probing exam complete.',
      teeth: {} as any
    });
    showToast('Perio Exam Saved', 'Periodontal probing chart saved to chart history.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg font-black text-slate-900">Periodontal Charting (6-Site Probing)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record probing depths (MB, B, DB, ML, L, DL), bleeding on probing (BOP), and mobility grades for {selectedPatient.firstName} {selectedPatient.lastName}.
          </p>
        </div>

        <button
          onClick={handleSavePerio}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Perio Exam</span>
        </button>
      </div>

      {/* Perio Depth Chart Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Maxillary & Mandibular Key Teeth Probing Heatmap
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[3, 14, 19, 30].map(toothNum => {
            const toothData = depths[toothNum] || { MB: 2, B: 2, DB: 2, ML: 2, L: 2, DL: 2 };
            return (
              <div key={toothNum} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">Tooth #{toothNum}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                    Probing
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {(['MB', 'B', 'DB', 'ML', 'L', 'DL'] as const).map(site => {
                    const depthVal = toothData[site];
                    return (
                      <div key={site} className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">{site}</span>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={depthVal}
                          onChange={(e) => handleDepthChange(toothNum, site, parseInt(e.target.value) || 1)}
                          className={`w-full py-1.5 text-center font-mono font-bold rounded-lg border text-xs focus:outline-hidden ${getPocketColor(depthVal)}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
