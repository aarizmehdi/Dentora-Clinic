import React, { useState, useRef, useEffect } from 'react';
import { useDentora } from '../../context/DentoraContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  ShieldAlert,
  CheckCircle2,
  Filter,
  X,
  Activity,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Stethoscope
} from 'lucide-react';
import { AppointmentStatus, Appointment, Provider, Operatory } from '../../types/dental';
import { AppointmentActions } from '../common/AppointmentActions';
import { sendWhatsAppMessage, formatPhoneForWhatsApp } from '../../lib/ultramsg';

export const ScheduleView: React.FC<{
  onOpenNewAppointmentModal: (prefill?: {time?: string, operatoryId?: string, providerId?: string}) => void;
  viewMode?: 'operatory' | 'doctor';
}> = ({ onOpenNewAppointmentModal, viewMode: initialViewMode = 'operatory' }) => {
  const {
    currentLocation,
    appointments,
    filteredOperatories,
    providers,
    patients,
    selectedDate,
    setSelectedDate,
    updateAppointmentStatus,
    selectPatient,
    setActiveTab,
    showToast,
    timeFormat,
    deleteAppointment,
    startVisit,
  } = useDentora();

  const [selectedProviderId, setSelectedProviderId] = useState<string>('all');
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'operatory' | 'doctor'>(initialViewMode);
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  const d = new Date();
  const todayString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const formatTimeDisplay = (time24: string) => {
    if (timeFormat === '24h') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatMinsToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const isTimeSlotAvailable = (slotTime: string) => {
    if (selectedDate > todayString) return true;
    if (selectedDate < todayString) return false;
    
    const now = new Date();
    const currentMinsRoundedDown = now.getHours() * 60 + (now.getMinutes() >= 30 ? 30 : 0);
    return timeToMinutes(slotTime) >= currentMinsRoundedDown;
  };

  const todayApts = appointments.filter(a =>
    a.locationId === currentLocation?.id &&
    a.date === selectedDate &&
    a.status !== 'cancelled' &&
    (viewMode === 'operatory' || selectedProviderId === 'all' || a.providerId === selectedProviderId)
  );

  let openTime = currentLocation?.operatingHours?.open || '08:00';
  const closeTime = currentLocation?.operatingHours?.close || '17:00';
  
  if (selectedDate === todayString) {
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes() >= 30 ? 30 : 0;
    const currentStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
    
    // Hide past hours today (start grid at the current time)
    if (currentStr > openTime && currentStr < closeTime) {
      openTime = currentStr;
    }
  }
  
  const generateTimeSlots = (start: string, end: string) => {
    const slots = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let currentMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    
    while (currentMins <= endMins) {
      const h = Math.floor(currentMins / 60).toString().padStart(2, '0');
      const m = (currentMins % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      currentMins += 30; // 30-minute intervals
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(openTime, closeTime);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_chair':
        return { label: 'In Chair', color: 'bg-teal-500 text-white border-teal-600' };
      case 'checked_in':
        return { label: 'Checked In', color: 'bg-amber-500 text-white border-amber-600' };
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-600 text-white border-emerald-700' };
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-blue-600 text-white border-blue-700' };
      default:
        return { label: 'Scheduled', color: 'bg-slate-700 text-white border-slate-800' };
    }
  };

  const selectedApt = selectedAptId ? appointments.find(a => a.id === selectedAptId) : null;
  const selectedPatient = selectedApt ? patients.find(p => p.id === selectedApt.patientId) : null;
  const selectedProvider = selectedApt ? providers.find(pr => pr.id === selectedApt.providerId) : null;
  const selectedOperatory = selectedApt ? filteredOperatories.find(o => o.id === selectedApt.operatoryId) : null;

  const handleSendWhatsApp = async () => {
    if (!selectedPatient) return;
    if (!selectedPatient.phone) {
      showToast('No Phone Number', 'Patient does not have a registered phone number.', 'warning');
      return;
    }
    const message = `Hello *${selectedPatient.firstName}*, this is a friendly reminder from *${currentLocation?.name || clinic?.name || 'our practice'}* regarding your appointment scheduled for *${selectedApt?.date}* at *${selectedApt?.startTime ? formatTimeDisplay(selectedApt.startTime) : ''}* (${selectedApt?.procedureSummary || 'General Visit'}). Please reply to confirm or reschedule!`;
    const phone = formatPhoneForWhatsApp(selectedPatient.phone, clinic?.countryCode || '92');
    
    const success = await sendWhatsAppMessage(clinic?.whatsappConfig?.instanceId, clinic?.whatsappConfig?.token, phone, message);
    if (success) {
      showToast('WhatsApp Sent', `Reminder sent to ${selectedPatient.firstName}.`, 'success');
    } else {
      showToast('WhatsApp Failed', 'Could not send WhatsApp message. Check UltraMsg credentials.', 'danger');
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Sleek Toolbar Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Left: Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            <button 
              onClick={handlePrevDay} 
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Interactive Date Picker Container */}
            <div 
              onClick={() => {
                try {
                  dateInputRef.current?.showPicker();
                } catch (e) {
                  dateInputRef.current?.focus();
                }
              }}
              className="relative flex items-center gap-2 px-3 py-1 text-xs font-bold text-slate-800 font-mono cursor-pointer hover:bg-white rounded-lg transition-all"
            >
              <CalendarIcon className="w-4 h-4 text-teal-600 pointer-events-none" />
              <span className="pointer-events-none">{selectedDate}</span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="absolute w-0 h-0 opacity-0 overflow-hidden"
              />
            </div>
            <button onClick={handleNextDay} className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-2xs">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(todayString)}
            className="px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-xl transition-all"
          >
            Today
          </button>
        </div>

        {/* Right Controls: View Switcher, Provider Filter, Book Button */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('operatory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'operatory' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>By Room</span>
            </button>
            <button
              onClick={() => setViewMode('doctor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'doctor' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>By Provider</span>
            </button>
          </div>

          {/* Provider Select Filter */}
          {viewMode === 'doctor' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">All Providers</option>
                {providers.map(pr => (
                  <option key={pr.id} value={pr.id}>{pr.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Book Appointment Button */}
          {selectedDate >= todayString ? (
            <button
              onClick={onOpenNewAppointmentModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Book Appointment</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200">
              <span>View Only (Past)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Schedule Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs w-full">
          {/* Column Headers */}
          <div
            className="grid border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-600 uppercase tracking-wider"
            style={{ 
              gridTemplateColumns: `80px repeat(${
                viewMode === 'operatory' 
                  ? filteredOperatories.length 
                  : (selectedProviderId === 'all' ? providers.length : 1)
              }, minmax(0, 1fr))` 
            }}
          >
            <div className="py-3 px-3 border-r border-slate-200 text-center flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            {viewMode === 'operatory' ? (
              filteredOperatories.map(op => (
                <div key={op.id} className="py-3 px-4 border-r border-slate-200 last:border-r-0 text-center truncate">
                  <span className="text-slate-900 font-bold text-sm">{op.name}</span>
                  {op.isHygiene && <span className="block text-[10px] text-purple-700 font-semibold normal-case tracking-normal">Hygiene Operatory</span>}
                </div>
              ))
            ) : (
              (selectedProviderId === 'all' ? providers : providers.filter(p => p.id === selectedProviderId)).map(pr => (
                <div key={pr.id} className="py-3 px-4 border-r border-slate-200 last:border-r-0 text-center truncate">
                  <span className="text-slate-900 font-bold text-sm">{pr.name}</span>
                  <span className="block text-[10px] text-slate-500 font-semibold normal-case tracking-normal">{pr.specialty}</span>
                </div>
              ))
            )}
          </div>

          {/* Time Grid Rows */}
          <div className="divide-y divide-slate-100 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {timeSlots.map(time => (
              <div
                key={time}
                id={`time-slot-${time}`}
                className="grid hover:bg-slate-50/50 transition-colors"
                style={{
                  gridTemplateColumns: `80px repeat(${viewMode === 'operatory' ? filteredOperatories.length : providers.length}, minmax(0, 1fr))`,
                  minHeight: '70px',
                }}
              >
              {/* Time Slot Label */}
              <div className="px-3 border-r border-slate-200 flex items-center justify-center font-mono text-slate-400 text-xs font-semibold bg-slate-50/30">
                {formatTimeDisplay(time)}
              </div>

              {/* Grid Cells */}
              {viewMode === 'operatory' ? (
                filteredOperatories.map(op => {
                  const timeMins = timeToMinutes(time);
                  const cellEndMins = timeMins + 30;

                  const cellApts = todayApts.filter(a => {
                    if (a.operatoryId !== op.id) return false;
                    const start = timeToMinutes(a.startTime);
                    const end = timeToMinutes(a.endTime);
                    return start < cellEndMins && end > timeMins;
                  });

                  const startingApts = cellApts.filter(a => {
                    const start = timeToMinutes(a.startTime);
                    return start >= timeMins && start < cellEndMins;
                  });

                  let gaps: { startMins: number, endMins: number }[] = [];
                  if (cellApts.length === 0) {
                    gaps.push({ startMins: timeMins, endMins: cellEndMins });
                  } else if (cellApts.length === 1) {
                    const apt = cellApts[0];
                    const aptStart = timeToMinutes(apt.startTime);
                    const aptEnd = timeToMinutes(apt.endTime);
                    if (aptStart > timeMins) gaps.push({ startMins: timeMins, endMins: aptStart });
                    if (aptEnd < cellEndMins) gaps.push({ startMins: aptEnd, endMins: cellEndMins });
                  }

                  return (
                    <div key={op.id} className="p-1.5 border-r border-slate-100 last:border-r-0 relative">
                      {startingApts.map(apt => {
                        const patient = patients.find(p => p.id === apt.patientId);
                        const provider = providers.find(pr => pr.id === apt.providerId);
                        const statusInfo = getStatusBadge(apt.status);
                        if (!patient || !statusInfo) return null;

                        const topOffsetPercent = ((timeToMinutes(apt.startTime) - timeMins) / 30) * 100;
                        const heightPercent = ((timeToMinutes(apt.endTime) - timeToMinutes(apt.startTime)) / 30) * 100;

                        return (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAptId(apt.id)}
                            style={{
                              position: 'absolute',
                              top: `calc(${topOffsetPercent}% + 6px)`,
                              left: '6px',
                              right: '6px',
                              height: `calc(${heightPercent}% - 12px)`,
                              zIndex: 10
                            }}
                            className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between hover:shadow-md transition-all ${statusInfo.color}`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-xs sm:text-sm leading-tight truncate">{patient.firstName} {patient.lastName}</span>
                                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-black/20 shrink-0">
                                  {statusInfo.label}
                                </span>
                              </div>
                              <p className="text-xs leading-tight opacity-90 truncate mt-1">{apt.procedureSummary}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs opacity-80 pt-1.5 border-t border-white/20 mt-2">
                              <span className="truncate">{provider?.name.split(',')[0]}</span>
                              {patient.alerts.length > 0 && <ShieldAlert className="w-3.5 h-3.5 text-rose-300 shrink-0" />}
                            </div>
                          </div>
                        );
                      })}
                      
                      {gaps.map((gap, idx) => {
                        const topPercent = ((gap.startMins - timeMins) / 30) * 100;
                        const heightPercent = ((gap.endMins - gap.startMins) / 30) * 100;
                        const bookTimeStr = formatMinsToTime(gap.startMins);
                        // Ensure button is large enough to click and looks decent, min 58px was the full block.
                        // We offset top and height by 6px to match padding, but if it's full size we use standard.
                        return (
                          <div
                            key={idx}
                            onClick={() => isTimeSlotAvailable(bookTimeStr) && onOpenNewAppointmentModal({ time: bookTimeStr, operatoryId: op.id })}
                            style={{
                              position: 'absolute',
                              top: `calc(${topPercent}% + 2px)`,
                              height: `calc(${heightPercent}% - 4px)`,
                              left: '4px',
                              right: '4px'
                            }}
                            className={`rounded-xl border border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all flex items-center justify-center text-slate-300 hover:text-teal-600 group ${isTimeSlotAvailable(bookTimeStr) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                          >
                            <span className="font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                              {isTimeSlotAvailable(bookTimeStr) ? `+ Book ${bookTimeStr}` : 'Past'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                (selectedProviderId === 'all' ? providers : providers.filter(p => p.id === selectedProviderId)).map(pr => {
                  const timeMins = timeToMinutes(time);
                  const cellEndMins = timeMins + 30;

                  const cellApts = todayApts.filter(a => {
                    if (a.providerId !== pr.id) return false;
                    const start = timeToMinutes(a.startTime);
                    const end = timeToMinutes(a.endTime);
                    return start < cellEndMins && end > timeMins;
                  });

                  const startingApts = cellApts.filter(a => {
                    const start = timeToMinutes(a.startTime);
                    return start >= timeMins && start < cellEndMins;
                  });

                  let gaps: { startMins: number, endMins: number }[] = [];
                  if (cellApts.length === 0) {
                    gaps.push({ startMins: timeMins, endMins: cellEndMins });
                  } else if (cellApts.length === 1) {
                    const apt = cellApts[0];
                    const aptStart = timeToMinutes(apt.startTime);
                    const aptEnd = timeToMinutes(apt.endTime);
                    if (aptStart > timeMins) gaps.push({ startMins: timeMins, endMins: aptStart });
                    if (aptEnd < cellEndMins) gaps.push({ startMins: aptEnd, endMins: cellEndMins });
                  }

                  return (
                    <div key={pr.id} className="p-1.5 border-r border-slate-100 last:border-r-0 relative">
                      {startingApts.map(apt => {
                        const patient = patients.find(p => p.id === apt.patientId);
                        const op = filteredOperatories.find(o => o.id === apt.operatoryId);
                        const statusInfo = getStatusBadge(apt.status);
                        if (!patient || !statusInfo) return null;

                        const topOffsetPercent = ((timeToMinutes(apt.startTime) - timeMins) / 30) * 100;
                        const heightPercent = ((timeToMinutes(apt.endTime) - timeToMinutes(apt.startTime)) / 30) * 100;

                        return (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAptId(apt.id)}
                            style={{
                              position: 'absolute',
                              top: `calc(${topOffsetPercent}% + 6px)`,
                              left: '6px',
                              right: '6px',
                              height: `calc(${heightPercent}% - 12px)`,
                              zIndex: 10
                            }}
                            className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between hover:shadow-md transition-all ${statusInfo.color}`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-xs sm:text-sm leading-tight truncate">{patient.firstName} {patient.lastName}</span>
                                <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-black/20 shrink-0">
                                  {statusInfo.label}
                                </span>
                              </div>
                              <p className="text-xs leading-tight opacity-90 truncate mt-1">{apt.procedureSummary}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs opacity-80 pt-1.5 border-t border-white/20 mt-2">
                              <span className="truncate">{op?.name}</span>
                              {patient.alerts.length > 0 && <ShieldAlert className="w-3.5 h-3.5 text-rose-300 shrink-0" />}
                            </div>
                          </div>
                        );
                      })}

                      {gaps.map((gap, idx) => {
                        const topPercent = ((gap.startMins - timeMins) / 30) * 100;
                        const heightPercent = ((gap.endMins - gap.startMins) / 30) * 100;
                        const bookTimeStr = formatMinsToTime(gap.startMins);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => isTimeSlotAvailable(bookTimeStr) && onOpenNewAppointmentModal({ time: bookTimeStr, providerId: pr.id })}
                            style={{
                              position: 'absolute',
                              top: `calc(${topPercent}% + 2px)`,
                              height: `calc(${heightPercent}% - 4px)`,
                              left: '4px',
                              right: '4px'
                            }}
                            className={`rounded-xl border border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all flex items-center justify-center text-slate-300 hover:text-teal-600 group ${isTimeSlotAvailable(bookTimeStr) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                          >
                            <span className="font-semibold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                              {isTimeSlotAvailable(bookTimeStr) ? `+ Book ${bookTimeStr}` : 'Past'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Quick Action Modal */}
      {selectedApt && selectedPatient && (
        <div 
          onClick={() => setSelectedAptId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-4.5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/30 shrink-0">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight text-white">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Chart #{selectedPatient.chartNumber} {selectedPatient.phone ? `• ${selectedPatient.phone}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptId(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Scheduled Visit Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Visit</span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    {selectedApt.date} @ {formatTimeDisplay(selectedApt.startTime)}
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-slate-500 font-normal">Procedure:</span>
                    <span>{selectedApt.procedureSummary}</span>
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-slate-500 font-normal">Provider / Room:</span>
                    <span className="font-medium text-slate-800">{selectedProvider?.name || 'Unassigned'} ({selectedOperatory?.name || 'Main Room'})</span>
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-2">
                <AppointmentActions 
                  appointment={selectedApt} 
                  patient={selectedPatient} 
                  onActionComplete={() => {
                    // Close the panel if the visit starts or is cancelled
                    if (selectedApt.status === 'in_chair' || selectedApt.status === 'checked_in') {
                      setSelectedAptId(null);
                    }
                  }} 
                />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
