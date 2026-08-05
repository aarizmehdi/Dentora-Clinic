import React, { useState } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { Appointment, Patient } from '../../types/dental';
import { 
  CheckCircle2, 
  Activity, 
  UserCheck, 
  MessageCircle, 
  XCircle, 
  MoreVertical,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendWhatsAppMessage, formatPhoneForWhatsApp } from '../../lib/ultramsg';

interface AppointmentActionsProps {
  appointment: Appointment;
  patient?: Patient;
  onActionComplete?: () => void;
  variant?: 'compact' | 'full';
}

export const AppointmentActions: React.FC<AppointmentActionsProps> = ({ 
  appointment, 
  patient, 
  onActionComplete,
  variant = 'compact'
}) => {
  const { updateAppointmentStatus, startVisit, setActiveTab, selectPatient, clinic, showToast } = useDentora();
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusChange = (status: Appointment['status']) => {
    updateAppointmentStatus(appointment.id, status);
    setShowMenu(false);
    if (onActionComplete) onActionComplete();
  };

  const handleStartVisit = () => {
    startVisit(appointment.id);
    setShowMenu(false);
    if (onActionComplete) onActionComplete();
  };

  const handleWhatsApp = async () => {
    if (!patient?.phone) {
      showToast('No Phone Number', 'Patient does not have a registered phone number.', 'warning');
      return;
    }
    
    let message = clinic?.whatsappConfig?.appointmentReminderTemplate || `Hello *{PatientName}*,\n\nThis is a friendly reminder for your upcoming dental appointment on *{Date}* at *{Time}* with {ClinicName}.\n\nPlease reply to confirm or reschedule!`;
    message = message.replace('{PatientName}', patient.firstName);
    message = message.replace('{ClinicName}', clinic?.name || 'our clinic');
    message = message.replace('{Date}', appointment.date);
    message = message.replace('{Time}', appointment.startTime);
    
    const phone = formatPhoneForWhatsApp(patient.phone, clinic?.countryCode || '92');
    const success = await sendWhatsAppMessage(
      clinic?.whatsappConfig?.instanceId,
      clinic?.whatsappConfig?.token,
      phone,
      message
    );

    if (success) {
      showToast('Reminder Sent', `WhatsApp reminder sent to ${patient.firstName}.`, 'success');
    } else {
      showToast('Send Failed', 'Failed to send WhatsApp message. Check your UltraMsg credentials.', 'danger');
    }
    
    setShowMenu(false);
    if (onActionComplete) onActionComplete();
  };

  // Determine Primary Action
  let PrimaryAction = null;

  if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
    PrimaryAction = (
      <button
        onClick={(e) => { e.stopPropagation(); handleStatusChange('checked_in'); }}
        className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition shadow-sm w-full"
      >
        <UserCheck className="w-4 h-4" />
        <span>Check In</span>
      </button>
    );
  } else if (appointment.status === 'checked_in') {
    PrimaryAction = (
      <button
        onClick={(e) => { e.stopPropagation(); handleStartVisit(); }}
        className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-500 transition shadow-sm w-full"
      >
        <Activity className="w-4 h-4" />
        <span>Start Visit</span>
      </button>
    );
  } else if (appointment.status === 'in_chair') {
    PrimaryAction = (
      <button
        onClick={(e) => { e.stopPropagation(); handleStartVisit(); }}
        className="flex items-center justify-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-100 transition shadow-sm w-full"
      >
        <Activity className="w-4 h-4" />
        <span>Resume Visit</span>
      </button>
    );
  } else if (appointment.status === 'completed') {
    PrimaryAction = (
      <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold w-full">
        <CheckCircle2 className="w-4 h-4" />
        <span>Completed</span>
      </div>
    );
  } else {
    PrimaryAction = (
      <div className="flex items-center justify-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold w-full capitalize">
        <XCircle className="w-4 h-4" />
        <span>{appointment.status.replace('_', ' ')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex-1">
        {PrimaryAction}
      </div>

      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
              >
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusChange('confirmed'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <CalendarCheck className="w-4 h-4 text-slate-400" />
                    <span>Confirm Appointment</span>
                  </button>
                )}
                
                {appointment.status === 'in_chair' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusChange('completed'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </button>
                )}
                
                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Reminder</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusChange('cancelled'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition mt-1 pt-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Appointment</span>
                    </button>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
