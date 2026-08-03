import React from 'react';
import { useDentora, NavTab } from '../../context/DentoraContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  FileText,
  CreditCard,
  UserCheck,
  Settings,
  Plus,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Clock,
  Briefcase,
  BarChart2,
  PieChart,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export const Sidebar: React.FC<{
  onOpenNewPatientModal: () => void;
  onOpenNewAppointmentModal: () => void;
}> = ({ onOpenNewPatientModal, onOpenNewAppointmentModal }) => {
  const { activeTab, setActiveTab, activeVisitAppointmentId, clinic } = useDentora();

  return (
    <aside className="w-[260px] bg-white text-slate-600 flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-slate-200 print:hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {clinic?.logoUrl ? (
            <img src={clinic.logoUrl} alt="Clinic Logo" className="w-8 h-8 object-contain rounded-lg" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#2E8081] flex items-center justify-center text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 8 6 8 8C8 10 9.5 11.5 9.5 13.5C9.5 17 12 20 12 20C12 20 14.5 17 14.5 13.5C14.5 11.5 16 10 16 8C16 6 16 2 12 2Z" />
                <path d="M12 20C12 20 9 22 9 22" />
                <path d="M12 20C12 20 15 22 15 22" />
              </svg>
            </div>
          )}
          <span className="font-extrabold text-[18px] text-[#2E8081] tracking-tight truncate max-w-[170px]" title={clinic?.name || 'DentaClinic'}>
            {clinic?.name || 'DentaClinic'}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 text-[13px] font-medium">
        <div className="space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
              activeTab === 'dashboard' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={onOpenNewAppointmentModal}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-slate-50 text-slate-500`}
          >
            <Plus className="w-[18px] h-[18px]" />
            <span>New Appointment</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Clinic Workflow</p>
          <button
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
              activeTab === 'patients' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-[18px] h-[18px]" />
            <span>Patients Directory</span>
          </button>
          
          <button
            onClick={() => setActiveTab('visit_workspace')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-semibold ${
              activeTab === 'visit_workspace' 
                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-[18px] h-[18px]" />
              <span>Odontogram</span>
            </div>
            {activeVisitAppointmentId && (
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]" title="Active Visit in progress" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
              activeTab === 'schedule' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-[18px] h-[18px]" />
            <span>Appointments</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Practice</p>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
              activeTab === 'billing' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCard className="w-[18px] h-[18px]" />
            <span>Billing</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
              activeTab === 'settings' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-[18px] h-[18px]" />
            <span>Practice Settings</span>
          </button>
        </div>
      </nav>

      <div className="p-4 space-y-1.5 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-500 transition-all text-[13px] font-medium">
          <HelpCircle className="w-[18px] h-[18px]" />
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};
