import React, { useState } from 'react';
import { useDentora } from '../../context/DentoraContext';
import {
  Search,
  UserPlus,
  ShieldAlert,
  Phone,
  Users,
  Calendar,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PatientList: React.FC<{
  onOpenNewPatientModal: () => void;
}> = ({ onOpenNewPatientModal }) => {
  const { patients, selectPatient, selectedPatient, appointments, toothConditions } = useDentora();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alert'>('all');

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chartNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.insurance?.providerName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'alert') return p.alerts.length > 0;
    return true;
  });

  const alertPatientsCount = patients.filter(p => p.alerts.length > 0).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-5 p-4 sm:p-8"
    >
      {/* Sleek Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Left: Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100/50 rounded-xl overflow-x-auto shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Patients</span>
            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[10px]">{patients.length}</span>
          </button>
          <button
            onClick={() => setStatusFilter('alert')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'alert' ? 'bg-white text-rose-700 shadow-sm ring-1 ring-rose-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Medical Alerts</span>
            {alertPatientsCount > 0 && (
              <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md text-[10px]">{alertPatientsCount}</span>
            )}
          </button>

        </div>

        {/* Right: Search & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto pr-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients, chart, phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          <button
            onClick={onOpenNewPatientModal}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-md shadow-teal-900/20 shrink-0"
            title="Register New Patient"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-xs">Register Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="space-y-2">
        <AnimatePresence>
          {patients.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm py-24"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No Patients Found</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                  Your practice directory is currently empty. Register your first patient to get started with charting and scheduling.
                </p>
                <button
                  onClick={onOpenNewPatientModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition shadow-md shadow-teal-900/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register New Patient</span>
                </button>
              </div>
            </motion.div>
          ) : filteredPatients.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center"
            >
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No matching results</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
            </motion.div>
          ) : (
            filteredPatients.map((patient, index) => {
              const isSelected = selectedPatient?.id === patient.id;
              const patientApts = appointments
                .filter(a => a.patientId === patient.id && a.status === 'completed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const lastVisitDate = patient.lastVisitDate || (patientApts.length > 0 ? patientApts[0].date : null);
              
              // Get last treatment from completed appointments' procedure summary
              const lastTreatmentApt = patientApts.length > 0 ? patientApts[0] : null;
              let lastTreatment = lastTreatmentApt?.procedureSummary || '';
              
              // Fallback: get from tooth conditions
              if (!lastTreatment) {
                const patientConds = toothConditions
                  .filter(c => c.patientId === patient.id && c.status !== 'existing')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                lastTreatment = patientConds.length > 0 ? patientConds[0].description : '';
              }

              const hasAlerts = patient.alerts && patient.alerts.length > 0;
              const upcomingApt = appointments
                .find(a => a.patientId === patient.id && ['scheduled', 'confirmed', 'checked_in'].includes(a.status));
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  exit={{ opacity: 0 }}
                  key={patient.id}
                  onClick={() => selectPatient(patient.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'bg-teal-50/60 border-teal-200 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-teal-200'
                  }`}
                >
                  {/* Avatar */}
                  {patient.avatar ? (
                    <img src={patient.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
                      hasAlerts 
                        ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800' 
                        : 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-800'
                    }`}>
                      {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                  )}

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        {patient.firstName} {patient.lastName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                        {patient.chartNumber}
                      </span>
                      {hasAlerts && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md shrink-0">
                          <ShieldAlert className="w-3 h-3" /> Alert
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {patient.phone}
                      </span>
                      {lastVisitDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-teal-500" />
                          Last: {new Date(lastVisitDate).toLocaleDateString()}
                        </span>
                      )}
                      {lastTreatment && (
                        <span className="hidden sm:flex items-center gap-1 truncate max-w-[200px] text-slate-400">
                          {lastTreatment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Indicators */}
                  <div className="flex items-center gap-3 shrink-0">
                    {upcomingApt && (
                      <span className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {upcomingApt.date === new Date().toISOString().split('T')[0] 
                          ? `Today ${upcomingApt.startTime}` 
                          : `${new Date(upcomingApt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} ${upcomingApt.startTime}`
                        }
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
