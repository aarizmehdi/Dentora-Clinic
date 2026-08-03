import React from 'react';
import { useDentora } from '../../context/DentoraContext';
import { OdontogramView } from '../charting/OdontogramView';
import { Activity, Clock, CheckCircle2, User, Calendar, Play } from 'lucide-react';

export const VisitWorkspaceView: React.FC = () => {
  const { 
    activeVisitAppointmentId, 
    appointments, 
    patients, 
    completeVisit,
    startVisit,
    timeFormat
  } = useDentora();

  const formatTime = (time24: string) => {
    if (timeFormat === '24h') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingApts = appointments
    .filter(a => a.date === today && (a.status === 'scheduled' || a.status === 'confirmed'))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const appointment = appointments.find(a => a.id === activeVisitAppointmentId);
  const patient = patients.find(p => p.id === appointment?.patientId);

  if (!appointment || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50 p-6 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-teal-500 opacity-20 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2rem] shadow-xl border border-teal-400/30 flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Activity className="w-12 h-12 text-white stroke-[2]" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Clinical Charting</h2>
        <p className="text-base text-slate-500 mb-10 max-w-md text-center leading-relaxed">
          Select a patient from today's schedule below to start a new active visit, or navigate to the Patients Directory.
        </p>

        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden relative z-10">
          <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Today's Schedule
            </h3>
            <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{upcomingApts.length}</span>
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
            {upcomingApts.length === 0 ? (
              <div className="p-8 text-center text-sm font-medium text-slate-400">
                No upcoming appointments for today.
              </div>
            ) : (
              upcomingApts.map(apt => {
                const pt = patients.find(p => p.id === apt.patientId);
                if (!pt) return null;
                return (
                  <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {pt.avatar ? (
                        <img src={pt.avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-100">
                          {pt.firstName[0]}{pt.lastName[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {pt.firstName} {pt.lastName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3" /> {formatTime(apt.startTime)}
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-slate-600">{apt.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startVisit(apt.id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3" /> Start Visit
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Clinical Workspace (Odontogram + SOAP) */}
      <div className="flex-1">
        <OdontogramView />
      </div>
    </div>
  );
};
