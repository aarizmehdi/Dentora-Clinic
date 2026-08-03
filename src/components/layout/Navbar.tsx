import React, { useState, useEffect, useRef } from 'react';
import { useDentora } from '../../context/DentoraContext';
import {
  MapPin,
  ChevronDown,
  Search,
  UserCheck,
  Shield,
  Stethoscope,
  Smile,
  Bell,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { UserRole } from '../../types/dental';

export const Navbar: React.FC = () => {
  const {
    locations,
    currentLocation,
    setCurrentLocationId,
    currentRole,
    setCurrentRole,
    currentUser,
    selectedPatient,
    setSearchOpen,
    activeTab,
    setActiveTab,
    showToast,
    activeVisitAppointmentId,
    appointments,
    patients,
    completeVisit,
    timeFormat,
  } = useDentora();

  const [isLocationOpen, setLocationOpen] = useState(false);
  const [isRoleOpen, setRoleOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  const formatTime = (time24: string) => {
    if (timeFormat === '24h') return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
        setRoleOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLocationOpen(false);
    setRoleOpen(false);
    setNotifOpen(false);
  }, [activeTab]);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'patients': return 'Patient Directory';
      case 'schedule': return 'Appointment Calendar';
      case 'doctor_schedule': return 'Doctor Schedule';
      case 'clinical_chart': return 'Clinical Charting Workspace';
      case 'visit_workspace': return 'Odontogram Workspace';
      case 'perio': return 'Periodontal Chart';
      case 'settings': return 'Practice Settings';
      default: return 'Dentora';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin / Director', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Shield };
      case 'dentist':
        return { label: 'Lead Dentist (D.D.S.)', color: 'bg-[#E6F3F3] text-[#2E8081] border-[#B2D8D8]', icon: Stethoscope };
      case 'hygienist':
        return { label: 'Hygienist (R.D.H.)', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Smile };
      case 'front_desk':
        return { label: 'Front Desk Coordinator', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck };
    }
  };

  const currentRoleBadge = getRoleBadge(currentRole);
  const RoleIcon = currentRoleBadge.icon;

  if (activeTab === 'visit_workspace') {
    const appointment = appointments.find(a => a.id === activeVisitAppointmentId);
    const patient = patients.find(p => p.id === appointment?.patientId);

    if (appointment && patient) {
      return (
        <header ref={navRef} className="bg-white border-b border-slate-100 sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <h1 className="text-[18px] font-bold text-slate-800">
                {patient.firstName} {patient.lastName}
              </h1>
            </div>
            <div className="h-5 w-px bg-slate-200 mx-2" />
            <div className="text-slate-500 text-sm font-mono flex items-center gap-3">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400" />
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
            </div>
          </div>

          <button
            onClick={completeVisit}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black text-xs rounded-lg transition shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Visit</span>
          </button>
        </header>
      );
    }
  }

  return (
    <header ref={navRef} className="bg-white border-b border-slate-100 sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-8 print:hidden">
      {/* Left section: Breadcrumbs or Title (Placeholder for now) */}
      <div className="flex items-center gap-4">
        <h2 className="text-[18px] font-bold text-slate-800">
          {getTitle()}
        </h2>
      </div>

      {/* Middle section: Global Search trigger (Only on Dashboard) */}
      {activeTab === 'dashboard' ? (
        <div className="flex-1 max-w-lg mx-8 hidden lg:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[13px] text-slate-400 transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-[18px] h-[18px]" />
              <span>Search patients, chart #, or CDT codes...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-slate-500 font-medium">
              ⌘K
            </kbd>
          </button>
        </div>
      ) : (
        <div className="flex-1 mx-8" />
      )}

      {/* Right section: Active Patient Badge + Role Switcher + Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Selected Patient Banner removed per user request */}

      </div>
    </header>
  );
};
