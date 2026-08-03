import React, { useState } from 'react';
import { useDentora } from '../../context/DentoraContext';
import {
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  Plus,
  Activity,
  FileText,
  Trash2,
  Users,
  MessageCircle,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { MedicalAlertSeverity } from '../../types/dental';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartHistoryView } from '../charting/ChartHistoryView';
import { VisitHistoryView } from './VisitHistoryView';
import { PatientAppointmentsView } from './PatientAppointmentsView';
import { PatientBillingView } from './PatientBillingView';
import { sendWhatsAppMessage, formatPhoneForWhatsApp } from '../../lib/ultramsg';

export const PatientDetailView: React.FC = () => {
  const {
    selectedPatient,
    selectPatient,
    updatePatient,
    activePatientTab,
    setActivePatientTab,
    toothConditions,
    showToast,
    appointments,
    clinic,
    timeFormat
  } = useDentora();

  const formatTime = (time24: string) => {
    if (timeFormat === '24h') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Medical Alert Form state
  const [showAddAlertModal, setAddAlertModal] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertDetails, setNewAlertDetails] = useState('');
  const [newAlertCategory, setNewAlertCategory] = useState<'allergy'|'cardiac'|'medication'|'bleeding'|'premedication'|'general'>('allergy');
  const [newAlertSeverity, setNewAlertSeverity] = useState<MedicalAlertSeverity>('high');

  if (!selectedPatient) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle) return;

    const newAlert = {
      id: `alert_${Date.now()}`,
      category: newAlertCategory,
      title: newAlertTitle,
      details: newAlertDetails,
      severity: newAlertSeverity,
    };

    updatePatient(selectedPatient.id, {
      alerts: [...selectedPatient.alerts, newAlert]
    });

    setAddAlertModal(false);
    setNewAlertTitle('');
    setNewAlertDetails('');
    showToast('Medical Alert Saved', `Flagged "${newAlertTitle}" on chart.`);
  };

  const handleDeleteAlert = (alertId: string) => {
    updatePatient(selectedPatient.id, {
      alerts: selectedPatient.alerts.filter(a => a.id !== alertId)
    });
    showToast('Alert Removed', 'Medical alert updated.');
  };

  const handleSendReminder = async () => {
    if (!clinic?.whatsappConfig?.enabled) {
      showToast('WhatsApp Disabled', 'Please enable WhatsApp integrations in Practice Settings.', 'warning');
      return;
    }
    
    // Find next appointment
    const nextApt = appointments
      .filter(a => a.patientId === selectedPatient.id && new Date(`${a.date}T${a.startTime}`) > new Date())
      .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())[0];

    let message = clinic.whatsappConfig.appointmentReminderTemplate || 'Hello *{PatientName}*, this is a friendly reminder for your appointment on *{Date}* at *{Time}* with {ClinicName}.';
    message = message.replace('{PatientName}', selectedPatient.firstName);
    message = message.replace('{ClinicName}', clinic.name);
    
    if (nextApt) {
      message = message.replace('{Date}', new Date(nextApt.date).toLocaleDateString());
      message = message.replace('{Time}', formatTime(nextApt.startTime));
    } else {
      message = `Hello *${selectedPatient.firstName}*, this is a message from ${clinic.name}. Please contact us to schedule your next visit!`;
    }

    const phone = formatPhoneForWhatsApp(selectedPatient.phone, clinic.countryCode || '1');
    const success = await sendWhatsAppMessage(clinic.whatsappConfig.instanceId, clinic.whatsappConfig.token, phone, message);
    if (success) {
      showToast('WhatsApp Sent', 'Reminder sent successfully.', 'success');
    } else {
      showToast('WhatsApp Failed', 'Failed to send message. Check credentials.', 'danger');
    }
  };
  const hasUpcomingApt = appointments.some(a => a.patientId === selectedPatient.id && new Date(`${a.date}T${a.startTime}`) > new Date() && ['scheduled', 'confirmed'].includes(a.status));

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sleek Minimalist Top-Bar & Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Top Row: Back Button & Essential Info */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => selectPatient(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Directory</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3">
              {selectedPatient.avatar ? (
                <img src={selectedPatient.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-teal-500/20">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black text-slate-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h1>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-bold">
                    {selectedPatient.chartNumber}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>DOB: {selectedPatient.dob}</span>
                  <span>•</span>
                  <span>{selectedPatient.phone}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedPatient.alerts.length > 0 && (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5" />
                {selectedPatient.alerts.length} Medical Flags
              </span>
            )}
          </div>
        </div>

        {/* Bottom Row: Tab Navigation */}
        <div className="px-2 py-1.5 flex flex-wrap items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActivePatientTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap ${
              activePatientTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePatientTab('medical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap ${
              activePatientTab === 'medical' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Medical Alerts</span>
            {selectedPatient.alerts.length > 0 && (
              <span className="px-1 py-0.2 rounded bg-rose-500 text-white text-[9px]">{selectedPatient.alerts.length}</span>
            )}
          </button>
          <button
            onClick={() => setActivePatientTab('chart_history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap ${
              activePatientTab === 'chart_history' ? 'bg-teal-600 text-white' : 'text-teal-700 hover:bg-teal-50 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Chart History
          </button>
          <button
            onClick={() => setActivePatientTab('visit_history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap ${
              activePatientTab === 'visit_history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Visit History
          </button>
          <button
            onClick={() => setActivePatientTab('appointments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap ${
              activePatientTab === 'appointments' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActivePatientTab('billing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap ${
              activePatientTab === 'billing' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Billing & Invoices
          </button>
          <button
            onClick={() => setActivePatientTab('documents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap ${
              activePatientTab === 'documents' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1">
        <AnimatePresence mode='wait'>
          {activePatientTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Phone Number</span>
                      <span className="font-semibold text-slate-900">{selectedPatient.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Full Address</span>
                      <span className="font-semibold text-slate-900">{selectedPatient.address}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Gender</span>
                      <span className="font-semibold text-slate-900">{selectedPatient.gender === 'F' ? 'Female' : 'Male'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Last Visit</span>
                      <span className="font-semibold text-slate-900">{selectedPatient.lastVisitDate || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {hasUpcomingApt && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <button
                      onClick={handleSendReminder}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold transition shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activePatientTab === 'medical' && (
            <motion.div 
              key="medical"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    Medical Alerts & Clinical Precautions
                  </h2>
                  <p className="text-xs text-slate-500">Flags appear prominently on odontogram and scheduling screens.</p>
                </div>
                <button
                  onClick={() => setAddAlertModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Alert</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {selectedPatient.alerts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                      <p className="text-sm">No medical alerts recorded for this patient.</p>
                    </div>
                  )}
                  {selectedPatient.alerts.map(alert => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={alert.id}
                      className={`p-4 rounded-xl border flex items-start justify-between shadow-sm ${
                        alert.severity === 'high'
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{alert.title}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border bg-white/50 font-bold">
                            {alert.category}
                          </span>
                        </div>
                        <p className="text-xs mt-1.5 leading-relaxed opacity-90">{alert.details}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activePatientTab === 'chart_history' && (
            <motion.div key="chart_history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChartHistoryView />
            </motion.div>
          )}

          {activePatientTab === 'visit_history' && (
            <motion.div key="visit_history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VisitHistoryView />
            </motion.div>
          )}
          {activePatientTab === 'appointments' && (
            <motion.div key="appointments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PatientAppointmentsView />
            </motion.div>
          )}
          {activePatientTab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PatientBillingView />
            </motion.div>
          )}
          {activePatientTab === 'documents' && (
            <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-bold text-slate-600">Patient Documents & Radiographs</p>
              <p className="text-xs">This section is currently under construction.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal to Add New Medical Alert */}
      <AnimatePresence>
        {showAddAlertModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Flag Medical Alert for {selectedPatient.firstName}
              </h3>

              <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alert Category</label>
                  <select
                    value={newAlertCategory}
                    onChange={(e) => setNewAlertCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="allergy">Drug / Latex Allergy</option>
                    <option value="premedication">Pre-Medication Required</option>
                    <option value="cardiac">Cardiac / Hypertension</option>
                    <option value="bleeding">Bleeding Disorder / Anticoagulant</option>
                    <option value="medication">High-Risk Medication</option>
                    <option value="general">General Clinical Note</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alert Title (e.g. Penicillin Allergy)</label>
                  <input
                    type="text"
                    required
                    value={newAlertTitle}
                    onChange={(e) => setNewAlertTitle(e.target.value)}
                    placeholder="e.g. Latex Allergy"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Instructions & Details</label>
                  <textarea
                    rows={3}
                    value={newAlertDetails}
                    onChange={(e) => setNewAlertDetails(e.target.value)}
                    placeholder="e.g. Use non-latex gloves exclusively. Amoxicillin contraindicated."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity Level</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 font-semibold text-rose-700 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value="high"
                        checked={newAlertSeverity === 'high'}
                        onChange={() => setNewAlertSeverity('high')}
                      />
                      High Severity
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold text-amber-700 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value="medium"
                        checked={newAlertSeverity === 'medium'}
                        onChange={() => setNewAlertSeverity('medium')}
                      />
                      Medium Warning
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddAlertModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-sm transition"
                  >
                    Save Alert
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
