import React from 'react';
import { useDentora } from '../../context/DentoraContext';
import { AppointmentActions } from '../common/AppointmentActions';
import { Calendar } from 'lucide-react';

export const PatientAppointmentsView: React.FC = () => {
  const { appointments, selectedPatient, providers, locations, timeFormat } = useDentora();

  const formatTime = (time24: string) => {
    if (timeFormat === '24h') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  if (!selectedPatient) return null;

  const patientAppointments = appointments
    .filter(a => a.patientId === selectedPatient.id)
    .sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());

  if (patientAppointments.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-bold text-slate-600">No Appointments Found</p>
        <p className="text-xs">This patient has no recorded appointments.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-4 overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-3">Date & Time</div>
        <div className="col-span-3">Provider & Location</div>
        <div className="col-span-4">Reason</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      <div className="divide-y divide-slate-100">
        {patientAppointments.map(apt => {
          const provider = providers.find(p => p.id === apt.providerId);
          const location = locations.find(l => l.id === apt.locationId);
          
          return (
            <div key={apt.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition">
              <div className="col-span-3">
                <p className="text-sm font-bold text-slate-900">{new Date(apt.date).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-bold text-slate-700">{provider?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{location?.name}</p>
              </div>
              <div className="col-span-4">
                <p className="text-sm text-slate-700 font-medium">{apt.procedureSummary || 'General Visit'}</p>
              </div>
              <div className="col-span-2 flex justify-end">
                <AppointmentActions appointment={apt} patient={selectedPatient} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
