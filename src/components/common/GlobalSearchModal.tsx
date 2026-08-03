import React, { useState, useEffect } from 'react';
import { useDentora, NavTab } from '../../context/DentoraContext';
import { Search, User, Calendar, FileText, X, ArrowRight, ShieldAlert, Activity, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cdtProcedures } from '../../data/cdtCodes';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setSearchOpen,
    patients,
    selectPatient,
    setActiveTab,
    appointments,
    toothConditions,
  } = useDentora();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
    p.chartNumber.toLowerCase().includes(query.toLowerCase()) ||
    p.phone.includes(query)
  );

  const filteredProcedures = cdtProcedures.filter(proc =>
    proc.code.toLowerCase().includes(query.toLowerCase()) ||
    proc.description.toLowerCase().includes(query.toLowerCase())
  );

  const handlePatientSelect = (patientId: string, targetTab: NavTab = 'patients') => {
    selectPatient(patientId);
    setActiveTab(targetTab);
    setSearchOpen(false);
    setQuery('');
  };

  const handleQuickNav = (tab: NavTab) => {
    setActiveTab(tab);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/20 border border-white max-w-2xl w-full overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Search Header */}
            <div className="flex items-center px-6 py-5 border-b border-slate-100/80 gap-4 bg-white/50">
              <Search className="w-6 h-6 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patients, charts, or CDT codes..."
                className="w-full text-base font-medium text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-medium text-xs">
                  <Command className="w-3 h-3" /> K
                </kbd>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results Content */}
            <div className="p-4 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Patients Results */}
          <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Patients ({filteredPatients.length})</p>
              <div className="space-y-2">
                {filteredPatients.length === 0 ? (
                  <p className="text-[15px] font-medium text-slate-400 py-4 text-center">No matching patient records found.</p>
                ) : (
                  filteredPatients.slice(0, 5).map(patient => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.id, 'patients')}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/40 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        {patient.avatar ? (
                          <img src={patient.avatar} alt="" className="w-9 h-9 rounded-full object-cover shadow-inner" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shadow-inner">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{patient.firstName} {patient.lastName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600 font-bold">{patient.chartNumber}</span>
                            {patient.alerts.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold tracking-wide uppercase">
                                <ShieldAlert className="w-3 h-3" />
                                {patient.alerts.length} Alert{patient.alerts.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            DOB: {patient.dob} • Phone: {patient.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientSelect(patient.id, 'clinical_chart');
                          }}
                          className="text-xs px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition-colors"
                        >
                          Chart
                        </button>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </motion.div>
                  ))
                )}
            </div>
          </div>

          {/* CDT Procedure Code Reference */}
          {query && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">CDT Procedure Codes</p>
              <div className="space-y-2">
                {filteredProcedures.slice(0, 4).map(proc => (
                  <div key={proc.code} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100/50">
                        {proc.code}
                      </span>
                      <span className="text-[15px] font-semibold text-slate-700">{proc.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-slate-50/80 backdrop-blur-md border-t border-slate-100/80 flex items-center justify-between text-xs font-medium text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 shadow-[0_2px_0_0_rgba(226,232,240,1)] text-slate-500 font-mono font-bold">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 shadow-[0_2px_0_0_rgba(226,232,240,1)] text-slate-500 font-mono font-bold">Esc</kbd> Close</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
