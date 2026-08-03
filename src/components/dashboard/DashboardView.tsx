import React from 'react';
import { useDentora } from '../../context/DentoraContext';
import {
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Plus,
  ArrowUpRight,
  DollarSign,
  UserPlus,
  Clock,
  MessageCircle,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { AppointmentStatus } from '../../types/dental';
import { motion, AnimatePresence } from 'framer-motion';
import { AppointmentActions } from '../common/AppointmentActions';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'scheduled': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'checked_in': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'in_chair': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'cancelled': 
    case 'no_show': return 'bg-rose-50 text-rose-600 border-rose-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const DashboardView: React.FC<{
  onOpenNewPatientModal: () => void;
  onOpenNewAppointmentModal: () => void;
}> = ({ onOpenNewPatientModal, onOpenNewAppointmentModal }) => {
  const {
    currentLocation,
    currentUser,
    appointments,
    filteredOperatories,
    patients,
    setActiveTab,
    selectPatient,
    startVisit,
    updateAppointmentStatus,
    showToast,
    timeFormat
  } = useDentora();

  const formatTime = (time24: string) => {
    if (timeFormat === '24h') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const todayString = new Date().toISOString().split('T')[0];
  
  const activeApts = appointments.filter(a => 
    a.locationId === currentLocation.id && 
    patients.some(p => p.id === a.patientId)
  );

  const todayApts = activeApts.filter(a => a.date === todayString);
  const todayAptsPatients = todayApts.map(apt => patients.find(p => p.id === apt.patientId)).filter(Boolean);
  const alertsToday = todayAptsPatients.filter(p => p && p.alerts && p.alerts.length > 0).length;
  const completedToday = todayApts.filter(a => a.status === 'completed').length;
  
  // Total Patients Today should count unique patients
  const totalPatientsToday = new Set(todayApts.map(a => a.patientId)).size;

  // Upcoming Schedule Logic
  const scheduleApts = activeApts.filter(a => 
    !['completed', 'cancelled', 'no_show'].includes(a.status)
  );

  const sortedScheduleApts = scheduleApts.sort((a, b) => {
    const aDateTime = new Date(`${a.date}T${a.startTime}`).getTime();
    const bDateTime = new Date(`${b.date}T${b.startTime}`).getTime();

    const getPriority = (status: string) => {
      if (status === 'in_chair') return 0;
      if (status === 'checked_in') return 1;
      return 2; // Scheduled
    };

    if (a.date === b.date) {
      const pA = getPriority(a.status);
      const pB = getPriority(b.status);
      if (pA !== pB) return pA - pB;
      return aDateTime - bDateTime;
    }
    
    return aDateTime - bDateTime;
  });

  const displayApts = sortedScheduleApts.slice(0, 5);
  const hasMoreApts = sortedScheduleApts.length > 5;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Good morning, {currentUser.name.split(',')[0]}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {currentLocation.name} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewAppointmentModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[13px] transition shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
          <button
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[13px] transition shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-teal-600" />
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-teal-50/50 text-teal-600 ring-1 ring-teal-100/50">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-slate-500">Total Patients Today</span>
          </div>
          <span className="text-3xl font-black text-slate-800 tracking-tight">{totalPatientsToday}</span>
        </motion.div>
        
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-teal-50/50 text-teal-600 ring-1 ring-teal-100/50">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-slate-500">Active Operatories</span>
          </div>
          <span className="text-3xl font-black text-slate-800 tracking-tight">{filteredOperatories.length}</span>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-teal-50/50 text-teal-600 ring-1 ring-teal-100/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-slate-500">Completed Visits</span>
          </div>
          <span className="text-3xl font-black text-slate-800 tracking-tight">{completedToday}</span>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-rose-50/50 text-rose-600 ring-1 ring-rose-100/50">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-bold text-slate-500">Alerts Today</span>
          </div>
          <span className="text-3xl font-black text-slate-800 tracking-tight">{alertsToday}</span>
        </motion.div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Upcoming Schedule
          </h2>
        </div>
          
          {displayApts.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
              <Clock className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-[14px] font-bold text-slate-700">No appointments scheduled</p>
              <p className="text-[13px] text-slate-500 mt-1">Your schedule is clear for today.</p>
              <button
                onClick={onOpenNewAppointmentModal}
                className="mt-4 px-4 py-2 rounded-lg bg-teal-50 text-teal-600 font-bold text-[12px] hover:bg-teal-100 transition shadow-sm"
              >
                + Add Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {displayApts.map(apt => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  const isToday = apt.date === todayString;
                  return (
                    <motion.div 
                      key={apt.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* Date/Time Box */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-200 transition-colors shrink-0">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-teal-600/70 transition-colors text-center px-1">
                            {isToday ? 'Today' : new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[13px] font-black text-slate-700 group-hover:text-teal-700 transition-colors">{formatTime(apt.startTime)}</span>
                        </div>
                        
                        {/* Patient Info */}
                        <div>
                          <p className="text-[15px] font-bold text-slate-800">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[13px] text-slate-500 font-medium">{apt.procedureSummary}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                        {/* Status Badge */}
                        <div className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(apt.status)}`}>
                          {apt.status.replace('_', ' ')}
                        </div>
                        
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                        
                        <div className="shrink-0 flex items-center justify-end">
                          <AppointmentActions appointment={apt} patient={patient} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {hasMoreApts && (
                <div className="pt-4 text-center">
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition"
                  >
                    View All Upcoming Appointments →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
    </motion.div>
  );
};
