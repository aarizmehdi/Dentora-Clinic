import React, { useState, useEffect } from 'react';
import { DentoraProvider, useDentora } from './context/DentoraContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AppSkeleton } from './components/layout/AppSkeleton';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientList } from './components/patients/PatientList';
import { PatientDetailView } from './components/patients/PatientDetailView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { OdontogramView } from './components/charting/OdontogramView';
import { VisitWorkspaceView } from './components/workspace/VisitWorkspaceView';
import { PracticeSettingsView } from './components/settings/PracticeSettingsView';
import { InvoiceManagementView } from './components/billing/InvoiceManagementView';
import { NewAppointmentModal } from './components/modals/NewAppointmentModal';
import { NewPatientModal } from './components/modals/NewPatientModal';
import { AuthView } from './components/auth/AuthView';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { activeTab, currentUser, clinic, selectedPatient } = useDentora();
  const [isNewPatientOpen, setNewPatientOpen] = useState(false);
  const [isNewAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [appointmentPrefill, setAppointmentPrefill] = useState<{time?: string, operatoryId?: string, providerId?: string}>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (clinic && currentUser) {
      // Premium artificial loading delay (2s) to show skeleton and simulate heavy data fetch
      const timer = setTimeout(() => setIsReady(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [clinic, currentUser]);

  useEffect(() => {
    if (clinic?.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = clinic.logoUrl;
    }
    if (clinic?.name) {
      document.title = `${clinic.name} - Dentora`;
    }
  }, [clinic?.logoUrl, clinic?.name]);

  const handleOpenAppointmentModal = (prefill?: {time?: string, operatoryId?: string, providerId?: string}) => {
    setAppointmentPrefill(prefill || {});
    setNewAppointmentOpen(true);
  };

  if (!currentUser) {
    return <AuthView />;
  }

  if (!clinic || !isReady) {
    return <AppSkeleton />;
  }

  if (!clinic.isOnboarded) {
    return <OnboardingFlow />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewPatientModal={() => setNewPatientOpen(true)}
            onOpenNewAppointmentModal={() => handleOpenAppointmentModal()}
          />
        );
      case 'patients':
        return selectedPatient ? (
          <PatientDetailView />
        ) : (
          <PatientList onOpenNewPatientModal={() => setNewPatientOpen(true)} />
        );
      case 'schedule':
        return (
          <ScheduleView
            onOpenNewAppointmentModal={handleOpenAppointmentModal}
            viewMode="operatory"
          />
        );
      case 'visit_workspace':
        return <VisitWorkspaceView />;
      case 'billing':
        return <InvoiceManagementView />;
      case 'settings':
        return <PracticeSettingsView />;
      default:
        return (
          <DashboardView
            onOpenNewPatientModal={() => setNewPatientOpen(true)}
            onOpenNewAppointmentModal={() => handleOpenAppointmentModal()}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-800 font-sans flex antialiased selection:bg-[#2E8081] selection:text-white overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <Sidebar
        onOpenNewPatientModal={() => setNewPatientOpen(true)}
        onOpenNewAppointmentModal={() => handleOpenAppointmentModal()}
      />
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 print:overflow-visible print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedPatient?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastContainer />
      <GlobalSearchModal />

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setNewAppointmentOpen(false)}
        prefillData={appointmentPrefill}
      />
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setNewPatientOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <DentoraProvider>
      <AppContent />
    </DentoraProvider>
  );
}
