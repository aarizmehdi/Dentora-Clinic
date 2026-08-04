import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Clinic, Location, Provider, Operatory, Patient, 
  Appointment, ToothCondition, PerioExam,
  ClinicalSOAPNote, User, UserRole, AppointmentStatus,
  ClinicService, Invoice
} from '../types/dental';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, doc, setDoc, updateDoc, onSnapshot, 
  query, where, getDoc, deleteDoc 
} from 'firebase/firestore';

export type NavTab = 
  | 'dashboard' 
  | 'patients' 
  | 'schedule'
  | 'clinical_chart'
  | 'visit_workspace'
  | 'settings'
  | 'billing';

export type PatientTab = 
  | 'overview' 
  | 'medical' 
  | 'appointments' 
  | 'visit_history' 
  | 'chart_history' 
  | 'documents'
  | 'billing';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}

interface DentoraContextType {
  clinic: Clinic | null;
  updateClinic: (updates: Partial<Clinic>) => void;
  locations: Location[];
  currentLocation: Location | null;
  setCurrentLocationId: (id: string) => void;
  currentUser: User | null;
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole) => void;
  providers: Provider[];
  operatories: Operatory[];
  filteredOperatories: Operatory[];
  addOperatory: (op: Omit<Operatory, 'id' | 'clinicId'>) => void;
  removeOperatory: (id: string) => void;
  
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activePatientTab: PatientTab;
  setActivePatientTab: (tab: PatientTab) => void;

  // Settings
  timeZone: string;
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  addProvider: (provider: Omit<Provider, 'id' | 'clinicId'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;

  pendingInvoiceDate: string | null;
  setPendingInvoiceDate: (date: string | null) => void;
  // Patients
  patients: Patient[];
  selectedPatient: Patient | null;
  selectPatient: (id: string | null) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'clinicId' | 'chartNumber' | 'status' | 'registeredDate'>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => void;

  // Scheduling
  appointments: Appointment[];
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  addAppointment: (apt: Omit<Appointment, 'id' | 'clinicId'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;

  // Charting
  toothConditions: ToothCondition[];
  addToothCondition: (cond: Omit<ToothCondition, 'id' | 'clinicId'>) => void;
  removeToothCondition: (id: string) => void;

  // Perio
  perioExams: PerioExam[];
  addPerioExam: (exam: Omit<PerioExam, 'id' | 'clinicId'>) => void;


  // SOAP Clinical Notes
  soapNotes: ClinicalSOAPNote[];
  addSOAPNote: (note: Omit<ClinicalSOAPNote, 'id' | 'clinicId'>) => void;
  updateSOAPNote: (id: string, updates: Partial<ClinicalSOAPNote>) => void;
  deleteSOAPNote: (id: string) => void;

  // Billing & Invoices
  clinicServices: ClinicService[];
  addClinicService: (service: Omit<ClinicService, 'id' | 'clinicId'>) => void;
  updateClinicService: (id: string, updates: Partial<ClinicService>) => void;
  deleteClinicService: (id: string) => void;

  invoices: Invoice[];
  saveInvoice: (invoice: Omit<Invoice, 'clinicId'>) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Auth
  login: (e: string, p: string) => Promise<void>;
  registerClinic: (e: string, p: string, cn: string, an: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Visit Workflow
  activeVisitAppointmentId: string | null;
  setActiveVisitAppointmentId: (id: string | null) => void;
  startVisit: (appointmentId: string) => void;
  completeVisit: () => void;

  currencySymbol: string;
}

const DEFAULT_SERVICES = [
  { name: 'Consultation', defaultPrice: 1500 },
  { name: 'Composite Filling', defaultPrice: 5000 },
  { name: 'Amalgam Filling', defaultPrice: 3500 },
  { name: 'Root Canal (RCT)', defaultPrice: 15000 },
  { name: 'Simple Extraction', defaultPrice: 5000 },
  { name: 'Surgical Extraction', defaultPrice: 15000 },
  { name: 'Porcelain Crown', defaultPrice: 20000 },
  { name: 'Dental Implant', defaultPrice: 100000 },
  { name: 'Denture', defaultPrice: 25000 },
  { name: 'Bridge', defaultPrice: 35000 },
  { name: 'Scaling and Root Planing (SRP)', defaultPrice: 8000 },
  { name: 'Sealant', defaultPrice: 2000 },
  { name: 'Night Guard', defaultPrice: 12000 },
  { name: 'Inlay / Onlay', defaultPrice: 12000 },
  { name: 'Post and Core', defaultPrice: 8000 },
  { name: 'Temporary Crown', defaultPrice: 3000 },
  { name: 'Glass Ionomer Filling', defaultPrice: 3000 },
  { name: 'Impacted Tooth Extraction', defaultPrice: 20000 },
  { name: 'Bone Graft', defaultPrice: 25000 },
  { name: 'Apicoectomy', defaultPrice: 15000 },
  { name: 'Fluoride Treatment', defaultPrice: 2000 },
  { name: 'Abscess Drainage', defaultPrice: 4000 },
  { name: 'Space Maintainer', defaultPrice: 6000 }
];

const DentoraContext = createContext<DentoraContextType | undefined>(undefined);

export const DentoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentClinicId, setCurrentClinicId] = useState<string | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocationId, setCurrentLocationId] = useState<string>('');
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [operatories, setOperatories] = useState<Operatory[]>([]);
  
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activePatientTab, setActivePatientTab] = useState<PatientTab>('overview');
  const [activeVisitAppointmentId, setActiveVisitAppointmentId] = useState<string | null>(null);
  const [pendingInvoiceDate, setPendingInvoiceDate] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Auto-derived Localization
  const country = clinic?.country || 'USA';
  let currencySymbol = '$';
  let timeZone = 'America/New_York';

  if (country === 'UK') {
    currencySymbol = '£';
    timeZone = 'Europe/London';
  } else if (country === 'Pakistan') {
    currencySymbol = 'Rs.';
    timeZone = 'Asia/Karachi';
  } else if (country === 'India') {
    currencySymbol = '₹';
    timeZone = 'Asia/Kolkata';
  }
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [toothConditions, setToothConditions] = useState<ToothCondition[]>([]);

  const [soapNotes, setSoapNotes] = useState<ClinicalSOAPNote[]>([]);
  const [perioExams, setPerioExams] = useState<PerioExam[]>([]);
  
  const [clinicServices, setClinicServices] = useState<ClinicService[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    let unsubUser: any = null;
    let existsTimeout: any = null;
    let firestoreConnectionTimeout: any = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let firstSnapshotReceived = false;
        
        // Timeout in case Firestore NEVER responds (e.g. database not created)
        firestoreConnectionTimeout = setTimeout(() => {
          if (!firstSnapshotReceived) {
            console.error("Firestore connection timed out. Database might not be created.");
            auth.signOut();
            setIsAuthReady(true);
          }
        }, 5000);

        unsubUser = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
          firstSnapshotReceived = true;
          if (firestoreConnectionTimeout) clearTimeout(firestoreConnectionTimeout);

          if (userDoc.exists()) {
            if (existsTimeout) {
              clearTimeout(existsTimeout);
              existsTimeout = null;
            }
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            setCurrentRole(userData.role);
            setCurrentClinicId(userData.clinicId);
            setIsAuthReady(true);
          } else {
            if (!existsTimeout) {
              existsTimeout = setTimeout(() => {
                console.error("User document not found. Corrupted state.");
                auth.signOut();
                setIsAuthReady(true);
              }, 3000);
            }
          }
        }, (error) => {
          console.error("Error fetching user data:", error);
          if (firestoreConnectionTimeout) clearTimeout(firestoreConnectionTimeout);
          if (existsTimeout) clearTimeout(existsTimeout);
          auth.signOut();
          setIsAuthReady(true);
        });
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
        setCurrentClinicId(null);
        if (unsubUser) {
          unsubUser();
          unsubUser = null;
        }
        if (existsTimeout) {
          clearTimeout(existsTimeout);
          existsTimeout = null;
        }
        if (firestoreConnectionTimeout) {
          clearTimeout(firestoreConnectionTimeout);
          firestoreConnectionTimeout = null;
        }
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribe();
      if (unsubUser) unsubUser();
      if (existsTimeout) clearTimeout(existsTimeout);
      if (firestoreConnectionTimeout) clearTimeout(firestoreConnectionTimeout);
    };
  }, []);

  useEffect(() => {
    if (!currentClinicId) return;

    const qProviders = query(collection(db, 'providers'), where('clinicId', '==', currentClinicId));
    const unsubProviders = onSnapshot(qProviders, (snapshot) => {
      setProviders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Provider)));
    });

    const qOperatories = query(collection(db, 'operatories'), where('clinicId', '==', currentClinicId));
    const unsubOperatories = onSnapshot(qOperatories, (snapshot) => {
      setOperatories(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Operatory)));
    });

    const unsubClinic = onSnapshot(doc(db, 'clinics', currentClinicId), (doc) => {
      if (doc.exists()) {
        const c = doc.data() as Clinic;
        c.id = doc.id;
        setClinic(c);
        if (c.locations) {
          setLocations(c.locations);
          if (c.locations.length > 0 && !currentLocationId) {
            setCurrentLocationId(c.locations[0].id);
          }
        }
      }
    });

    const qPatients = query(collection(db, 'patients'), where('clinicId', '==', currentClinicId));
    const unsubPatients = onSnapshot(qPatients, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Patient)));
    });

    const qAppointments = query(collection(db, 'appointments'), where('clinicId', '==', currentClinicId));
    const unsubAppointments = onSnapshot(qAppointments, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
    });

    const qConditions = query(collection(db, 'toothConditions'), where('clinicId', '==', currentClinicId));
    const unsubConditions = onSnapshot(qConditions, (snapshot) => {
      setToothConditions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ToothCondition)));
    });


    const qNotes = query(collection(db, 'soapNotes'), where('clinicId', '==', currentClinicId));
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      setSoapNotes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClinicalSOAPNote)));
    });

    const qPerio = query(collection(db, 'perioExams'), where('clinicId', '==', currentClinicId));
    const unsubPerio = onSnapshot(qPerio, (snapshot) => {
      setPerioExams(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PerioExam)));
    });

    const qServices = query(collection(db, 'clinicServices'), where('clinicId', '==', currentClinicId));
    let hasSeeded = false;
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClinicService));
      setClinicServices(services);

      // Auto-seed default PKR services if the clinic has zero services (e.g., new account)
      if (services.length === 0 && !hasSeeded && currentClinicId) {
        hasSeeded = true;
        DEFAULT_SERVICES.forEach(async (srv) => {
          const newRef = doc(collection(db, 'clinicServices'));
          await setDoc(newRef, {
            id: newRef.id,
            clinicId: currentClinicId,
            name: srv.name,
            defaultPrice: srv.defaultPrice
          });
        });
      }
    });

    const qInvoices = query(collection(db, 'invoices'), where('clinicId', '==', currentClinicId));
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice)));
    });

    return () => {
      unsubProviders();
      unsubOperatories();
      unsubClinic();
      unsubPatients();
      unsubAppointments();
      unsubConditions();
      unsubNotes();
      unsubPerio();
      unsubServices();
      unsubInvoices();
    };
  }, [currentClinicId, currentLocationId]);

  const login = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
  };
  
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const registerClinic = async (e: string, p: string, cn: string, an: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, e, p);
    const uid = userCredential.user.uid;
    
    const clinicRef = doc(collection(db, 'clinics'));
    const newClinic: Clinic = {
      id: clinicRef.id,
      name: cn,
      taxId: '',
      locations: [{
        id: `loc_${Date.now()}`,
        name: 'Main Location',
        code: 'MAIN',
        address: '123 Main St',
        phone: '(555) 000-0000',
        operatoriesCount: 1,
        operatingHours: {
          open: '08:00',
          close: '17:00'
        }
      }],
      subscriptionTier: 'basic',
      subscriptionStatus: 'active'
    };
    
    const newUser: User = {
      id: uid,
      clinicId: clinicRef.id,
      name: an,
      email: e,
      role: 'admin',
      title: 'Clinic Administrator',
      locationIds: [newClinic.locations[0].id],
    };

    const defaultProviderId = doc(collection(db, 'providers')).id;
    const newProvider: Provider = {
      id: defaultProviderId,
      clinicId: clinicRef.id,
      name: an,
      title: 'D.D.S.',
      specialty: 'General Dentistry',
      color: '#2E8081',
      locationIds: [newClinic.locations[0].id]
    };

    const defaultOperatoryId = doc(collection(db, 'operatories')).id;
    const newOperatory: Operatory = {
      id: defaultOperatoryId,
      clinicId: clinicRef.id,
      locationId: newClinic.locations[0].id,
      name: 'Operatory 1',
      equipmentType: 'Standard',
      isHygiene: false
    };

    // Helper to timeout firestore requests if DB is not created
    const withTimeout = (promise: Promise<any>, ms: number) => {
      let timeoutId: any;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Firestore database connection timed out. Did you click 'Create Database' in your Firebase Console?"));
        }, ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    try {
      await withTimeout(setDoc(clinicRef, newClinic), 10000);
      await withTimeout(setDoc(doc(db, 'users', uid), newUser), 10000);
      await withTimeout(setDoc(doc(db, 'providers', defaultProviderId), newProvider), 10000);
      await withTimeout(setDoc(doc(db, 'operatories', defaultOperatoryId), newOperatory), 10000);
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || "Failed to create database records.");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (!isAuthReady) {
    return <div className="h-screen flex items-center justify-center">Loading Dentora...</div>;
  }

  const currentLocation = locations.find(l => l.id === currentLocationId) || (locations.length > 0 ? locations[0] : null);
  const filteredOperatories = operatories.filter(op => op.locationId === currentLocationId);
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addProvider = async (newProv: Omit<Provider, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const ref = doc(collection(db, 'providers'));
    const p: Provider = { ...newProv, id: ref.id, clinicId: currentClinicId };
    await setDoc(ref, p);
    showToast('Provider Added', `${p.name} has been added to the practice.`);
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    if (!clinic || !currentClinicId) return;
    const updatedLocations = clinic.locations.map(l => l.id === id ? { ...l, ...updates } : l);
    await updateDoc(doc(db, 'clinics', currentClinicId), { locations: updatedLocations });
    showToast('Location Updated', 'Practice location settings saved.');
  };

  const addLocation = async (loc: Omit<Location, 'id'>) => {
    if (!clinic || !currentClinicId) return;
    const newLoc: Location = { ...loc, id: `loc_${Date.now()}` };
    const updatedLocations = [...(clinic.locations || []), newLoc];
    await updateDoc(doc(db, 'clinics', currentClinicId), { locations: updatedLocations });
    showToast('Location Added', `${newLoc.name} has been added.`);
  };

  const addOperatory = async (op: Omit<Operatory, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const ref = doc(collection(db, 'operatories'));
    const newOp: Operatory = { ...op, id: ref.id, clinicId: currentClinicId };
    await setDoc(ref, newOp);
    showToast('Operatory Added', `${newOp.name} created successfully.`);
  };

  const removeOperatory = async (id: string) => {
    await deleteDoc(doc(db, 'operatories', id));
    showToast('Operatory Removed', 'The room has been deleted from the system.', 'warning');
  };

  const selectPatient = (id: string | null) => {
    setSelectedPatientId(id);
  };

  const addPatient = async (newP: Omit<Patient, 'id' | 'clinicId' | 'chartNumber' | 'status' | 'registeredDate'>) => {
    if (!currentClinicId) throw new Error("No clinic id");
    const chartNumber = `DEN-${10000 + patients.length + 1}`;
    const ref = doc(collection(db, 'patients'));
    const newPatient: Patient = {
      ...newP,
      id: ref.id,
      clinicId: currentClinicId,
      chartNumber,
      status: 'active',
      registeredDate: new Date().toISOString().split('T')[0],
      alerts: newP.alerts || [],
      familyMembers: newP.familyMembers || [],
    };
    await setDoc(ref, newPatient);
    showToast('Patient Registered', `Patient ${newPatient.firstName} ${newPatient.lastName} (${chartNumber}) added successfully.`);
    return newPatient;
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    await updateDoc(doc(db, 'patients', id), updates);
    showToast('Record Updated', 'Patient record saved successfully.');
  };

  const addAppointment = async (aptData: Omit<Appointment, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const ref = doc(collection(db, 'appointments'));
    const newApt: Appointment = { ...aptData, id: ref.id, clinicId: currentClinicId };
    await setDoc(ref, newApt);
    showToast('Appointment Scheduled', `Booked for ${aptData.date} at ${aptData.startTime}`);
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    await updateDoc(doc(db, 'appointments', id), { status });
    const formattedStatus = status.replace('_', ' ').toUpperCase();
    showToast('Patient Flow Updated', `Appointment marked as ${formattedStatus}`);
  };

  const deleteAppointment = async (id: string) => {
    await deleteDoc(doc(db, 'appointments', id));
    showToast('Appointment Cancelled', 'The appointment has been removed.');
  };

  const addToothCondition = async (cond: Omit<ToothCondition, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const ref = doc(collection(db, 'toothConditions'));
    const newCond: ToothCondition = { 
      ...cond, 
      id: ref.id, 
      clinicId: currentClinicId,
      ...(activeVisitAppointmentId ? { appointmentId: activeVisitAppointmentId } : {})
    };
    await setDoc(ref, newCond);
    showToast('Odontogram Updated', `Tooth #${cond.toothNumber} (${cond.description}) recorded.`);
  };

  const removeToothCondition = async (id: string) => {
    await deleteDoc(doc(db, 'toothConditions', id));
    showToast('Chart Item Removed', 'Odontogram entry removed.');
  };

  const addPerioExam = async (exam: Omit<PerioExam, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const ref = doc(collection(db, 'perioExams'));
    const newExam: PerioExam = { ...exam, id: ref.id, clinicId: currentClinicId };
    await setDoc(ref, newExam);
    showToast('Perio Exam Recorded', 'Periodontal probing chart saved.');
  };


  const addSOAPNote = async (note: Omit<ClinicalSOAPNote, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const ref = doc(collection(db, 'soapNotes'));
    const payload: any = { 
      ...note, 
      id: ref.id, 
      clinicId: currentClinicId,
      ...(activeVisitAppointmentId ? { appointmentId: activeVisitAppointmentId } : {})
    };
    
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    await setDoc(ref, cleanPayload);
    showToast('Clinical Note Signed', 'SOAP progress note saved to electronic chart.');
  };

  const updateSOAPNote = async (id: string, updates: Partial<ClinicalSOAPNote>) => {
    await updateDoc(doc(db, 'soapNotes', id), updates);
    showToast('Note Updated', 'SOAP progress note has been modified.');
  };

  const deleteSOAPNote = async (id: string) => {
    await deleteDoc(doc(db, 'soapNotes', id));
    showToast('Note Deleted', 'Clinical note removed from record.', 'warning');
  };

  const updateClinic = async (updates: Partial<Clinic>) => {
    if (!currentClinicId) return;
    await updateDoc(doc(db, 'clinics', currentClinicId), updates);
    showToast('Clinic Updated', 'Global practice settings saved.');
  };

  const startVisit = (appointmentId: string) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    updateAppointmentStatus(appointmentId, 'in_chair');
    setActiveVisitAppointmentId(appointmentId);
    selectPatient(apt.patientId);
    setActiveTab('visit_workspace');
  };

  const completeVisit = () => {
    if (activeVisitAppointmentId) {
      updateAppointmentStatus(activeVisitAppointmentId, 'completed');
      setActiveVisitAppointmentId(null);
      setActiveTab('patients');
      setActivePatientTab('visit_history');
      setPendingInvoiceDate(`apt_${activeVisitAppointmentId}`);
      showToast('Visit Completed', 'Consultation data grouped to patient history.', 'success');
    }
  };

  const addClinicService = async (service: Omit<ClinicService, 'id' | 'clinicId'>) => {
    if (!currentClinicId) return;
    const newRef = doc(collection(db, 'clinicServices'));
    await setDoc(newRef, {
      ...service,
      clinicId: currentClinicId
    });
    showToast('Service Added', 'New service added to practice catalog.');
  };

  const updateClinicService = async (id: string, updates: Partial<ClinicService>) => {
    await updateDoc(doc(db, 'clinicServices', id), updates);
    showToast('Service Updated', 'Practice catalog updated.');
  };

  const deleteClinicService = async (id: string) => {
    await deleteDoc(doc(db, 'clinicServices', id));
    showToast('Service Deleted', 'Service removed from practice catalog.', 'warning');
  };

  const saveInvoice = async (invoice: Omit<Invoice, 'clinicId'>) => {
    if (!currentClinicId) return;
    const isUpdate = !!invoice.id;
    const ref = invoice.id ? doc(db, 'invoices', invoice.id) : doc(collection(db, 'invoices'));
    
    // Auto-generate invoice number if missing
    const invoiceNumber = invoice.invoiceNumber || `INV-${new Date().getFullYear()}-${ref.id.substring(0, 6).toUpperCase()}`;

    const payload: any = {
      ...invoice,
      id: ref.id,
      invoiceNumber,
      clinicId: currentClinicId
    };
    
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    await setDoc(ref, cleanPayload, { merge: true });
    
    showToast('Invoice Saved', isUpdate ? 'Invoice updated successfully.' : 'New invoice generated successfully.', 'success');
  };


  return (
    <DentoraContext.Provider
      value={{
        isAuthReady,
        currentUser,
        currentClinicId,
        clinic,
        updateClinic,
        locations,
        currentLocation,
        setCurrentLocationId,

        currentRole,
        setCurrentRole,
        providers,
        operatories,
        filteredOperatories,
        addOperatory,
        removeOperatory,
        activeTab,
        setActiveTab,
        activePatientTab,
        setActivePatientTab,
        patients,
        selectedPatient,
        selectPatient,
        addPatient,
        updatePatient,
        appointments,
        selectedDate,
        setSelectedDate,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        toothConditions,
        addToothCondition,
        removeToothCondition,
        perioExams,
        addPerioExam,

        soapNotes,
        addSOAPNote,
        updateSOAPNote,
        deleteSOAPNote,
        toasts,
        showToast,
        removeToast,
        isSearchOpen,
        setSearchOpen,
        timeZone,
        timeFormat,
        setTimeFormat,
        addProvider,
        updateLocation,
        addLocation,
        login,
        registerClinic,
        logout,
        resetPassword,
        // Visit Workflow
        activeVisitAppointmentId,
        setActiveVisitAppointmentId,
        pendingInvoiceDate,
        setPendingInvoiceDate,
        startVisit,
        completeVisit,

        // Billing
        clinicServices,
        addClinicService,
        updateClinicService,
        deleteClinicService,
        invoices,
        saveInvoice,
        
        currencySymbol,
      }}
    >
      {children}
    </DentoraContext.Provider>
  );
};

export const useDentora = () => {
  const context = useContext(DentoraContext);
  if (!context) {
    throw new Error('useDentora must be used within a DentoraProvider');
  }
  return context;
};
