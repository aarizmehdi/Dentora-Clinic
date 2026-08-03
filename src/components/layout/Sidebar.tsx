import React from 'react';
import { createPortal } from 'react-dom';
import { useDentora, NavTab } from '../../context/DentoraContext';
import { DentoraLogo } from '../common/DentoraLogo';
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
  MessageSquare,
  LogOut
} from 'lucide-react';

export const Sidebar: React.FC<{
  onOpenNewPatientModal: () => void;
  onOpenNewAppointmentModal: () => void;
}> = ({ onOpenNewPatientModal, onOpenNewAppointmentModal }) => {
  const { activeTab, setActiveTab, activeVisitAppointmentId, clinic, logout } = useDentora();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-[260px] bg-white text-slate-600 flex flex-col shrink-0 h-screen sticky top-0 select-none border-r border-slate-200 print:hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {clinic?.logoUrl ? (
            <img src={clinic.logoUrl} alt="Clinic Logo" className="w-8 h-8 object-contain rounded-lg" />
          ) : (
            <DentoraLogo className="w-8 h-8" />
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

      <div className="px-4 pb-6 mt-auto">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all font-semibold"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="text-[13px]">Log Out</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 mx-auto">
              <LogOut className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Sign Out?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to log out of {clinic?.name || 'Dentora'}? You will need to sign in again to access the dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-sm shadow-rose-200 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};
