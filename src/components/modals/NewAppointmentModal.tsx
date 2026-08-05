import React, { useState, useEffect } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { Calendar, Clock, User, Stethoscope, ShieldAlert, X, ChevronDown } from 'lucide-react';
import { sendWhatsAppMessage, formatPhoneForWhatsApp } from '../../lib/ultramsg';

export const NewAppointmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  prefillData?: { time?: string; operatoryId?: string; providerId?: string };
}> = ({ isOpen, onClose, prefillData }) => {
  const {
    patients,
    providers,
    filteredOperatories,
    operatories,
    currentLocation,
    addAppointment,
    selectedDate,
    appointments,
    showToast,
    clinic,
  } = useDentora();

  const [patientId, setPatientId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [operatoryId, setOperatoryId] = useState('');
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('');
  const [durationMin, setDurationMin] = useState(45);
  const [visitReason, setVisitReason] = useState('');
  const [notes, setNotes] = useState('');
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [isDurationDropdownOpen, setDurationDropdownOpen] = useState(false);

  const availableOperatories = filteredOperatories.length > 0 ? filteredOperatories : operatories;

  useEffect(() => {
    if (isOpen) {
      setPatientId('');
      setProviderId(prefillData?.providerId || (providers.length > 0 ? providers[0].id : ''));
      setOperatoryId(prefillData?.operatoryId || (availableOperatories.length > 0 ? availableOperatories[0].id : ''));
      setBookingDate(selectedDate);
      setStartTime(prefillData?.time || '');
      setDurationMin(45);
      setVisitReason('');
      setNotes('');
      setConflictError(null);
      setPatientSearch('');
      setPatientDropdownOpen(false);
      setTimeDropdownOpen(false);
      setDurationDropdownOpen(false);
    }
  }, [isOpen, selectedDate, prefillData, availableOperatories, providers]);

  if (!isOpen) return null;

  const selectedPatientObj = patients.find(p => p.id === patientId);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName} ${p.chartNumber}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Generate strict 15-min intervals based on operating hours
  const openTime = currentLocation?.operatingHours?.open || '08:00';
  const closeTime = currentLocation?.operatingHours?.close || '17:00';
  
  const generateTimeSlots = () => {
    const slots = [];
    const [startH, startM] = openTime.split(':').map(Number);
    const [endH, endM] = closeTime.split(':').map(Number);
    let currentMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    
    // Stop 15 mins before close so they can't book exactly at closing time
    while (currentMins <= endMins - 15) { 
      const h = Math.floor(currentMins / 60).toString().padStart(2, '0');
      const m = (currentMins % 60).toString().padStart(2, '0');
      
      const h12 = (Math.floor(currentMins / 60) % 12) || 12;
      const ampm = Math.floor(currentMins / 60) >= 12 ? 'PM' : 'AM';
      
      slots.push({
        value: `${h}:${m}`,
        label: `${h12.toString().padStart(2, '0')}:${m} ${ampm}`
      });
      currentMins += 15;
    }
    return slots;
  };

  const validTimeSlots = generateTimeSlots();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !providerId || !operatoryId || !startTime) return;
    setConflictError(null);

    // Calculate times in minutes for comparison
    const timeToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStartMins = timeToMinutes(startTime);
    const newEndMins = newStartMins + durationMin;

    // Check Clinic Operating Hours
    const openTime = currentLocation?.operatingHours?.open || '08:00';
    const closeTime = currentLocation?.operatingHours?.close || '17:00';
    const openMins = timeToMinutes(openTime);
    const closeMins = timeToMinutes(closeTime);

    if (newStartMins < openMins || newEndMins > closeMins) {
      // Format times for display (e.g. 08:00 AM)
      const formatTime = (time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      };
      setConflictError(`Cannot book at this time. Clinic operating hours are ${formatTime(openTime)} - ${formatTime(closeTime)}.`);
      return;
    }

    // Check for double-booking conflicts
    const dateAppointments = appointments.filter(a => a.date === bookingDate && a.status !== 'cancelled' && a.status !== 'no_show');
    
    let hasOperatoryConflict = false;
    let hasProviderConflict = false;

    for (const apt of dateAppointments) {
      const aptStartMins = timeToMinutes(apt.startTime);
      const aptEndMins = timeToMinutes(apt.endTime);
      
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      const isOverlap = newStartMins < aptEndMins && newEndMins > aptStartMins;

      if (isOverlap) {
        if (apt.operatoryId === operatoryId) {
          hasOperatoryConflict = true;
          break; // Hard block on operatory
        }
        if (apt.providerId === providerId) {
          hasProviderConflict = true;
        }
      }
    }

    if (hasOperatoryConflict) {
      setConflictError('This operatory is already booked for this time slot.');
      return;
    }
    if (hasProviderConflict) {
      // You can change this to a hard block if desired, but for now we'll soft warn or block
      setConflictError('This provider is already double-booked for this time slot.');
      return;
    }

    const endH = Math.floor(newEndMins / 60).toString().padStart(2, '0');
    const endM = (newEndMins % 60).toString().padStart(2, '0');
    const endTimeStr = `${endH}:${endM}`;

    addAppointment({
      patientId,
      providerId,
      operatoryId,
      locationId: currentLocation.id,
      date: bookingDate,
      startTime,
      endTime: endTimeStr,
      procedureCodes: [],
      procedureSummary: visitReason || 'General Visit',
      status: 'scheduled',
      notes,
      copayEstimate: 0,
    });

    if (clinic?.whatsappConfig?.enabled && selectedPatientObj?.phone) {
      const formatTime = (time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
      };
      
      let msg = clinic.whatsappConfig.appointmentBookedTemplate || 'Hello *{PatientName}*, your appointment is booked for *{Date}* at *{Time}* with {ClinicName}.';
      msg = msg.replace('{PatientName}', selectedPatientObj.firstName);
      msg = msg.replace('{ClinicName}', clinic.name);
      msg = msg.replace('{Date}', bookingDate);
      msg = msg.replace('{Time}', formatTime(startTime));
      
      const phone = formatPhoneForWhatsApp(selectedPatientObj.phone, clinic.countryCode || '1');
      sendWhatsAppMessage(clinic.whatsappConfig.instanceId, clinic.whatsappConfig.token, phone, msg).then(success => {
        if (success) {
          showToast('WhatsApp confirmation sent!');
        }
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Schedule Patient Appointment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Patient Lookup */}
          <div className="relative">
            <label className="font-bold text-slate-700 block mb-1">Search Patient</label>
            <div 
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white flex items-center justify-between cursor-pointer"
              onClick={() => setPatientDropdownOpen(!isPatientDropdownOpen)}
            >
              <span className={selectedPatientObj ? 'text-slate-900' : 'text-slate-400'}>
                {selectedPatientObj ? `${selectedPatientObj.firstName} ${selectedPatientObj.lastName} (${selectedPatientObj.chartNumber})` : 'Select a patient...'}
              </span>
            </div>
            {isPatientDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search..."
                  className="w-full p-2 border-b border-slate-100 text-xs outline-none"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">No patients found</div>
                  ) : (
                    filteredPatients.map(p => (
                      <div 
                        key={p.id}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center"
                        onClick={() => {
                          setPatientId(p.id);
                          setPatientDropdownOpen(false);
                          setPatientSearch('');
                        }}
                      >
                        <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                        <span className="text-slate-500 font-mono">{p.chartNumber}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Medical Alert Warning if selected patient has flags */}
          {selectedPatientObj && selectedPatientObj.alerts.length > 0 && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[11px]">Medical Alert Warning!</p>
                <p className="text-[10px] text-rose-800">
                  {selectedPatientObj.alerts.map(a => `${a.title}: ${a.details}`).join(' | ')}
                </p>
              </div>
            </div>
          )}

          {/* Conflict Error */}
          {conflictError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[11px]">Scheduling Conflict</p>
                <p className="text-[10px] text-red-800">{conflictError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dentist / Doctor</label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              >
                <option value="" disabled>Select Provider...</option>
                {providers.map(pr => (
                  <option key={pr.id} value={pr.id}>{pr.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Treatment Operatory</label>
              <select
                value={operatoryId}
                onChange={(e) => setOperatoryId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              >
                <option value="" disabled>Select Room...</option>
                {availableOperatories.map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                required
              />
            </div>

            <div className="relative">
              <label className="font-bold text-slate-700 block mb-1">Start Time</label>
              <div 
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setTimeDropdownOpen(!isTimeDropdownOpen);
                  setDurationDropdownOpen(false);
                  setPatientDropdownOpen(false);
                }}
              >
                <span className={startTime ? 'text-slate-900' : 'text-slate-400'}>
                  {startTime ? validTimeSlots.find(s => s.value === startTime)?.label : 'Select Time...'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              {isTimeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto custom-scrollbar">
                  {validTimeSlots.map(slot => (
                    <div 
                      key={slot.value}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900"
                      onClick={() => {
                        setStartTime(slot.value);
                        setTimeDropdownOpen(false);
                      }}
                    >
                      {slot.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="font-bold text-slate-700 block mb-1">Duration (mins)</label>
              <div 
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setDurationDropdownOpen(!isDurationDropdownOpen);
                  setTimeDropdownOpen(false);
                  setPatientDropdownOpen(false);
                }}
              >
                <span className="text-slate-900">
                  {durationMin === 30 ? '30 mins' : durationMin === 45 ? '45 mins' : durationMin === 60 ? '60 mins (1 hr)' : '90 mins (1.5 hrs)'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {isDurationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {[
                    { value: 30, label: '30 mins' },
                    { value: 45, label: '45 mins' },
                    { value: 60, label: '60 mins (1 hr)' },
                    { value: 90, label: '90 mins (1.5 hrs)' }
                  ].map(opt => (
                    <div 
                      key={opt.value}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900"
                      onClick={() => {
                        setDurationMin(opt.value);
                        setDurationDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Reason for Visit</label>
            <input
              type="text"
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              placeholder="e.g. New Patient Consult, Cleaning, Toothache..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Appointment Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient requests nitrous oxide."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
