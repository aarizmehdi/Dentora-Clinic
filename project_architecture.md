# Dentora Dental Practice Management System - Master Technical Architecture & Specification

> **Document Purpose**: This document is the single source of truth (SSoT) for the **Dentora** codebase. It is written with extreme precision and exhaustive detail so that any AI model, senior architect, or product manager can understand 100% of the project's architecture, data models, workflows, state lifecycle, integrations, and business logic without ambiguity or hallucination. Use this document directly as context for writing PRDs, architecting new features, refactoring, or integrating extensions.

---

## 1. Executive Summary & Product Vision

* **Product Name**: Dentora (Dental Practice Management System)
* **Target Audience**: Modern dental clinics, private practices, and multi-location dental groups.
* **Core Value Proposition**: Replaces legacy, clunky, desktop-bound dental software (like Dentrix, Eaglesoft, Open Dental) with a lightning-fast, sleek, single-page application (SPA) featuring:
  * Minimalist, premium, "Vercel / Stripe-like" UI/UX.
  * Multi-tenant cloud synchronization in real time (Firebase Firestore).
  * AI-powered dental charting & clinical progress notes (DeepSeek API).
  * Direct patient communication via WhatsApp automation (UltraMsg API).
  * Dynamic PDF generation for patient clinical charts and branded invoices (jsPDF).
  * Multi-location and operatory-based visual scheduling.
  * Multi-currency & localization support (Pakistan PKR, USA USD, UK GBP, India INR).

---

## 2. Technology Stack & Key Dependencies

| Layer | Technology | Version / Details | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime & Build** | Vite + React | React 19.x, Vite 6.x | Fast HMR, modern JSX runtime, strict ESM |
| **Language** | TypeScript | `~5.7.x` | Strict type checking, shared domain types in `types/dental.ts` |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | `@tailwindcss/vite` | Modern utility classes, glassmorphic styling, custom scrollbars |
| **UI Components & Icons** | Lucide React | `^1.16.0` | Minimalist line icons |
| **Animations** | Framer Motion & Motion | `^12.x` | Smooth page transitions, modal spring animations, toasts |
| **Backend & Auth** | Firebase SDK | `^11.x` (`firebase/auth`, `firebase/firestore`) | Email/password authentication, real-time NoSQL Firestore database |
| **AI Medical Scribe** | DeepSeek API | `deepseek-chat` model (JSON Mode) | Converts charted dental findings into professional SOAP progress notes |
| **Messaging & WhatsApp** | UltraMsg REST API | `api.ultramsg.com` | Automated WhatsApp delivery of booking confirmations, reminders, and base64 PDFs |
| **PDF Generation** | jsPDF + jsPDF-AutoTable | `jspdf ^2.5`, `jspdf-autotable ^3.8` | Generates clinical chart summaries and itemized billing invoices with clinic branding |
| **Image Hosting** | ImgBB REST API | `api.imgbb.com` | Practice logo upload and CDN storage |
| **Dental Packages** | `react-odontogram`, `react-teeth-selector` | Customized overlays | Interactive 32-tooth anatomical adult dental chart |

---

## 3. Complete File & Directory Map

```text
dentora-dental-practice-management/
├── .env                              # Local active environment variables (Firebase, DeepSeek, UltraMsg)
├── .env.example                      # Template for required environment keys
├── index.html                        # SPA HTML root with dynamic title & favicon bindings
├── package.json                      # NPM script definitions and dependencies
├── vite.config.ts                    # Vite config with React and Tailwind v4 plugins
├── tsconfig.json                     # TypeScript compiler configuration
├── project_architecture.md           # [THIS FILE] Master System Architecture & PRD Guide
├── src/
│   ├── main.tsx                      # App entry point, mounts <DentoraProvider> & <App>
│   ├── App.tsx                       # Root view router, layout shell (Sidebar + Navbar), modal container
│   ├── index.css                     # Global styles, Tailwind directives, custom scrollbar styling
│   ├── vite-env.d.ts                 # Vite client type definitions
│   │
│   ├── types/
│   │   └── dental.ts                 # Single source of truth for all domain interfaces and types
│   │
│   ├── context/
│   │   └── DentoraContext.tsx        # Centralized React Context: Firebase Auth, Firestore real-time listeners, CRUD actions
│   │
│   ├── lib/
│   │   ├── firebase.ts               # Firebase App, Auth, and Firestore initialization
│   │   ├── firebaseErrors.ts         # User-friendly error mapping for Firebase Auth exceptions
│   │   ├── deepseek.ts               # DeepSeek AI API caller for automated SOAP progress notes
│   │   ├── ultramsg.ts               # UltraMsg WhatsApp REST client (text messages & base64 PDF delivery)
│   │   ├── imgbb.ts                  # ImgBB image uploader for practice logos
│   │   ├── pdfGenerator.ts           # jsPDF generators for Clinical Records and Billing Invoices
│   │   └── printUtils.ts             # Silent / browser iframe printing utility for base64 PDFs
│   │
│   ├── data/
│   │   └── cdtCodes.ts               # ADA CDT dental procedure codes catalog (D0120, D2391, etc.)
│   │
│   └── components/
│       ├── auth/
│       │   └── AuthView.tsx          # Login, Register Clinic, Forgot Password modal with animated SVG branding
│       ├── onboarding/
│       │   └── OnboardingFlow.tsx    # 3-step setup wizard for first-time clinic accounts
│       ├── layout/
│       │   ├── Navbar.tsx            # Global top bar: Search trigger, branch/location switcher, user profile
│       │   ├── Sidebar.tsx           # Navigation tabs, quick add actions, practice branding
│       │   └── AppSkeleton.tsx       # Vercel-like animated skeleton loader during auth / Firestore sync
│       ├── common/
│       │   ├── DentoraLogo.tsx       # Branded tooth icon with geometric glow SVG animations
│       │   ├── GlobalSearchModal.tsx # Cmd/Ctrl+K search modal across patients and appointments
│       │   ├── ToastContainer.tsx    # Non-blocking animated toast notification banners
│       │   ├── MobileBlocker.tsx     # Graceful block banner restricting mobile viewport (requires desktop)
│       │   └── AppointmentActions.tsx# Reusable dropdown for changing appointment status & WhatsApp reminders
│       ├── dashboard/
│       │   └── DashboardView.tsx     # Practice analytics: Today's visits, revenue, scheduled chairs, quick actions
│       ├── schedule/
│       │   └── ScheduleView.tsx      # Multi-operatory daily calendar grid (8 AM - 6 PM), slot booking, conflict checks
│       ├── patients/
│       │   ├── PatientList.tsx       # Searchable, filterable patient roster with status badges
│       │   ├── PatientDetailView.tsx # Patient master profile with subtabs (Overview, Medical, History, Billing)
│       │   ├── PatientAppointmentsView.tsx # Filtered list of patient visits
│       │   ├── PatientBillingView.tsx# Patient invoice ledger and payment records
│       │   └── VisitHistoryView.tsx  # Chronological timeline of clinical SOAP notes and procedures
│       ├── workspace/
│       │   └── VisitWorkspaceView.tsx# Active chairside workflow hub (links appointment to live charting)
│       ├── charting/
│       │   ├── OdontogramView.tsx    # Interactive adult odontogram (32 teeth), treatment library, DeepSeek AI scribe
│       │   ├── CustomOdontogram.tsx  # Anatomical tooth grid component with surface selection
│       │   ├── PerioChartView.tsx    # Periodontal 6-point probing depth, bleeding, mobility recording
│       │   └── ChartHistoryView.tsx  # Full audit log of all charted dental procedures
│       ├── billing/
│       │   ├── InvoiceManagementView.tsx # Practice-wide invoices table, date filters, PDF download & WhatsApp send
│       │   └── InvoiceGeneratorModal.tsx # Dynamic billing calculator, procedure auto-import, discount calculation
│       ├── settings/
│       │   └── PracticeSettingsView.tsx  # Clinic details, logo upload, branch locations, operatories, providers, services, WhatsApp config
│       └── modals/
│           ├── NewAppointmentModal.tsx # Appointment creation modal with conflict detection & WhatsApp auto-confirm
│           └── NewPatientModal.tsx     # Comprehensive patient intake modal
```

---

## 4. Complete Domain Types & Data Models (`src/types/dental.ts`)

Every object in Dentora is strictly typed. All database documents store dates in ISO `YYYY-MM-DD` strings.

```typescript
// Roles permitted in the system
export type UserRole = 'admin' | 'dentist' | 'hygienist' | 'front_desk';

// Clinic branch / practice location
export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  operatoriesCount: number;
  operatingHours?: {
    open: string;  // e.g. "08:00"
    close: string; // e.g. "17:00"
  };
}

// UltraMsg WhatsApp credentials & templates
export interface WhatsAppConfig {
  instanceId: string;
  token: string;
  enabled: boolean;
  appointmentBookedTemplate?: string;
  appointmentReminderTemplate?: string;
  invoiceTemplate?: string;
  clinicalRecordTemplate?: string;
  invoiceDeliveryMode?: 'auto' | 'ask' | 'manual';
}

// Root multi-tenant entity
export interface Clinic {
  id: string;
  name: string;
  isOnboarded?: boolean;
  taxId: string;
  currency?: string;     // e.g., "PKR", "USD", "GBP"
  country?: string;      // e.g., "Pakistan", "USA", "UK", "India"
  countryCode?: string;  // e.g., "92", "1", "44", "91"
  logoUrl?: string;      // Hosted on ImgBB CDN
  locations: Location[];
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'past_due' | 'canceled';
  whatsappConfig?: WhatsAppConfig;
}

// Staff user account linked to Firebase Auth UID
export interface User {
  id: string;            // Firebase Auth UID
  clinicId: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;         // e.g. "Clinic Administrator"
  locationIds: string[];
  avatarUrl?: string;
}

// Clinical practitioner (Dentist, Hygienist)
export interface Provider {
  id: string;
  clinicId: string;
  name: string;
  title: string;         // e.g., "D.D.S.", "B.D.S.", "R.D.H."
  specialty: string;     // e.g., "General Dentistry", "Orthodontics", "Endodontics"
  color: string;         // Hex code used for schedule badge accent (e.g., "#2E8081")
  locationIds: string[];
}

// Physical treatment room / dental chair
export interface Operatory {
  id: string;
  clinicId: string;
  name: string;          // e.g., "Operatory 1", "Hygiene Suite"
  locationId: string;
  equipmentType: string;
  isHygiene: boolean;
}

// Patient medical alerts
export type MedicalAlertSeverity = 'high' | 'medium' | 'low';

export interface MedicalAlert {
  id: string;
  category: 'allergy' | 'cardiac' | 'medication' | 'bleeding' | 'premedication' | 'general';
  title: string;
  details: string;
  severity: MedicalAlertSeverity;
}

export interface FamilyMember {
  patientId: string;
  name: string;
  relationship: 'Spouse' | 'Child' | 'Parent' | 'Guarantor';
}

// Patient profile record
export interface Patient {
  id: string;
  clinicId: string;
  chartNumber: string;   // e.g., "DEN-10001"
  firstName: string;
  lastName: string;
  dob: string;           // YYYY-MM-DD
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email: string;
  address: string;
  preferredLocationId: string;
  preferredProviderId: string;
  alerts: MedicalAlert[];
  familyMembers: FamilyMember[];
  lastVisitDate?: string;
  nextRecallDate?: string;
  status: 'active' | 'inactive' | 'archived';
  avatar?: string;
  registeredDate: string;
}

// Dental tooth surfaces (Universal)
export type ToothSurface = 'O' | 'M' | 'D' | 'B' | 'L' | 'I' | 'Root';
// O = Occlusal, M = Mesial, D = Distal, B = Buccal, L = Lingual, I = Incisal

// Dental pathology & restorative condition types
export type ToothConditionType = 
  | 'decay' | 'amalgam' | 'composite' | 'crown' | 'rct' | 'implant' 
  | 'missing' | 'extraction_needed' | 'veneer' | 'bridge' | 'sealant' 
  | 'watch' | 'inlay_onlay' | 'post_core' | 'temporary_crown' | 'denture' 
  | 'glass_ionomer' | 'surgical_extraction' | 'impacted' | 'bone_graft' 
  | 'apicoectomy' | 'fracture' | 'srp' | 'fluoride' | 'abscess' 
  | 'night_guard' | 'space_maintainer' | 'ortho_bracket';

export type ToothStatus = 'existing' | 'condition' | 'planned' | 'completed';

export interface ToothCondition {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string; // Links condition to active visit
  toothNumber: number;   // 1 to 32 (Universal adult system)
  surfaces: ToothSurface[];
  conditionType: ToothConditionType;
  status: ToothStatus;
  cdtCode?: string;      // ADA CDT Code, e.g. "D2391"
  description: string;
  date: string;          // YYYY-MM-DD
  providerId: string;
}

// Periodontal probing site (6 points per tooth)
export type PerioSite = 'MB' | 'B' | 'DB' | 'ML' | 'L' | 'DL';

export interface PerioToothDepth {
  toothNumber: number;
  depths: Record<PerioSite, number>;      // Depth in mm (1 - 9)
  bleeding: Record<PerioSite, boolean>;   // Bleeding on probing (BOP)
  suppuration: Record<PerioSite, boolean>;// Pus / exudate
  mobility: 0 | 1 | 2 | 3;                // Miller mobility classification
}

export interface PerioExam {
  id: string;
  clinicId: string;
  patientId: string;
  date: string;
  providerId: string;
  teeth: Record<number, PerioToothDepth>;
  summary: string;
}

// Appointment lifecycle statuses
export type AppointmentStatus = 
  | 'scheduled'   // Booked on calendar
  | 'confirmed'   // Confirmed with patient
  | 'checked_in'   // Patient arrived in waiting area
  | 'in_chair'     // Actively undergoing treatment in operatory
  | 'completed'    // Visit completed, ledger updated
  | 'cancelled'    // Cancelled in advance
  | 'no_show';     // Patient failed to show up

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  providerId: string;
  operatoryId: string;
  locationId: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm 24-hour (e.g. "09:30")
  endTime: string;        // HH:mm 24-hour (e.g. "10:15")
  procedureCodes: string[];// CDT codes (e.g. ["D0120", "D1110"])
  procedureSummary: string;
  status: AppointmentStatus;
  notes?: string;
}

// Clinical Progress Note (SOAP narrative)
export interface ClinicalSOAPNote {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  providerId: string;
  subjective: string;    // Patient symptoms, chief complaint
  objective: string;     // Clinical exam, radiograph findings
  assessment: string;    // Diagnosis (e.g., symptomatic irreversible pulpitis)
  plan: string;          // Treatment rendered, Rx, post-op instructions
  isSigned: boolean;     // Digitally locked note
}

// Practice Service / Fee Schedule
export interface ClinicService {
  id: string;
  clinicId: string;
  name: string;
  defaultPrice: number;
}

// Line item in patient invoice
export interface InvoiceItem {
  id: string;
  serviceId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Patient Billing Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;  // e.g., "INV-2026-A1B2C3"
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  items: InvoiceItem[];
  discountType: 'fixed' | 'percentage' | 'none';
  discountValue: number;
  subtotal: number;
  grandTotal: number;
  status: 'paid' | 'unpaid';
  paymentMethod?: 'Cash' | 'Card' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa';
  deliveryStatus?: 'pending' | 'sent' | 'printed';
  isFinalized: boolean;   // Locked once paid or issued
}
```

---

## 5. Database Architecture & Firestore Collections

Dentora employs a **strict multi-tenant architecture**. Every collection is flat at the root of Firestore, and all reads/writes are filtered by `where('clinicId', '==', currentClinicId)`.

### Firestore Collection Index

| Collection Name | Document ID Format | Description |
| :--- | :--- | :--- |
| `clinics` | Auto-generated UUID | Clinic metadata, branding, branches (`locations[]`), WhatsApp config |
| `users` | Firebase Auth UID | User account, role (`admin`, `dentist`, etc.), assigned branch IDs |
| `providers` | Auto-generated UUID | Dentists & hygienists, specialty, calendar accent color |
| `operatories` | Auto-generated UUID | Physical treatment rooms linked to a specific `locationId` |
| `patients` | Auto-generated UUID | Demographics, medical alerts array, family relationships |
| `appointments` | Auto-generated UUID | Calendar slots, start/end times, room, provider, patient, status |
| `toothConditions` | Auto-generated UUID | Restorative & diagnostic tooth chart entries per tooth surface |
| `soapNotes` | Auto-generated UUID | Clinical progress notes signed by providers |
| `perioExams` | Auto-generated UUID | Periodontal probing exams with 6-point depths and BOP |
| `clinicServices` | Auto-generated UUID | Master fee catalog (auto-seeded on first clinic registration) |
| `invoices` | Auto-generated UUID | Financial records, line items, discounts, payment status |

### Real-Time Sync & Subscriptions
In `src/context/DentoraContext.tsx`:
1. When Firebase Auth emits an authenticated `user`, an `onSnapshot` listener subscribes to `users/{uid}`.
2. Once `user.clinicId` is resolved, 9 parallel `onSnapshot` listeners attach to all clinic data collections:
   * `clinics/{clinicId}`
   * `providers` where `clinicId == currentClinicId`
   * `operatories` where `clinicId == currentClinicId`
   * `patients` where `clinicId == currentClinicId`
   * `appointments` where `clinicId == currentClinicId`
   * `toothConditions` where `clinicId == currentClinicId`
   * `soapNotes` where `clinicId == currentClinicId`
   * `perioExams` where `clinicId == currentClinicId`
   * `clinicServices` where `clinicId == currentClinicId`
   * `invoices` where `clinicId == currentClinicId`
3. If `clinicServices` is empty upon first load, the system auto-seeds 23 standard dental procedures (e.g., Consultation, Composite, RCT, Crown, Implant, Extraction) with standard prices.

---

## 6. Complete State API (`DentoraContextType`)

Every component accesses global state through `const { ... } = useDentora()`. The full API is:

```typescript
interface DentoraContextType {
  // Practice & Location
  clinic: Clinic | null;
  updateClinic: (updates: Partial<Clinic>) => void;
  locations: Location[];
  currentLocation: Location | null;
  setCurrentLocationId: (id: string) => void;
  
  // Current Staff User & Role
  currentUser: User | null;
  updateUser: (updates: Partial<User>) => Promise<void>;
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole) => void;
  
  // Providers & Operatories
  providers: Provider[];
  addProvider: (provider: Omit<Provider, 'id' | 'clinicId'>) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => Promise<void>;
  operatories: Operatory[];
  filteredOperatories: Operatory[]; // Filtered by currentLocationId
  addOperatory: (op: Omit<Operatory, 'id' | 'clinicId'>) => void;
  updateOperatory: (id: string, updates: Partial<Operatory>) => Promise<void>;
  removeOperatory: (id: string) => void;
  
  // Navigation State
  activeTab: 'dashboard' | 'patients' | 'schedule' | 'clinical_chart' | 'visit_workspace' | 'settings' | 'billing';
  setActiveTab: (tab: NavTab) => void;
  activePatientTab: 'overview' | 'medical' | 'appointments' | 'visit_history' | 'chart_history' | 'documents' | 'billing';
  setActivePatientTab: (tab: PatientTab) => void;
  
  // System Settings & Localization
  timeZone: string;          // Auto-derived (e.g., "Asia/Karachi", "America/New_York")
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  currencySymbol: string;    // Auto-derived (Rs., $, £, ₹)
  updateLocation: (id: string, updates: Partial<Location>) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;
  
  // Patient Records
  patients: Patient[];
  selectedPatient: Patient | null;
  selectPatient: (id: string | null) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'clinicId' | 'chartNumber' | 'status' | 'registeredDate'>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  
  // Scheduling & Calendar
  appointments: Appointment[];
  selectedDate: string;      // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  addAppointment: (apt: Omit<Appointment, 'id' | 'clinicId'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  
  // Chairside Visit Workflow
  activeVisitAppointmentId: string | null;
  setActiveVisitAppointmentId: (id: string | null) => void;
  startVisit: (appointmentId: string) => void;
  completeVisit: () => void;
  
  // Restorative Odontogram Charting
  toothConditions: ToothCondition[];
  addToothCondition: (cond: Omit<ToothCondition, 'id' | 'clinicId'>) => void;
  removeToothCondition: (id: string) => void;
  
  // Periodontal Exam
  perioExams: PerioExam[];
  addPerioExam: (exam: Omit<PerioExam, 'id' | 'clinicId'>) => void;
  
  // SOAP Progress Notes
  soapNotes: ClinicalSOAPNote[];
  addSOAPNote: (note: Omit<ClinicalSOAPNote, 'id' | 'clinicId'>) => void;
  updateSOAPNote: (id: string, updates: Partial<ClinicalSOAPNote>) => void;
  deleteSOAPNote: (id: string) => void;
  
  // Billing & Fee Catalog
  clinicServices: ClinicService[];
  addClinicService: (service: Omit<ClinicService, 'id' | 'clinicId'>) => void;
  updateClinicService: (id: string, updates: Partial<ClinicService>) => void;
  deleteClinicService: (id: string) => void;
  invoices: Invoice[];
  saveInvoice: (invoice: Omit<Invoice, 'clinicId'>) => void;
  pendingInvoiceDate: string | null;
  setPendingInvoiceDate: (date: string | null) => void;
  
  // Toasts & Search Modal
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'danger') => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  
  // Authentication Actions
  login: (email: string, pass: string) => Promise<void>;
  registerClinic: (email: string, pass: string, clinicName: string, adminName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Database Maintenance
  clearAllDatabaseData: () => Promise<void>;
}
```

---

## 7. Deep-Dive: Core Modules & Workflows

### 7.1 Authentication & Onboarding Workflow
1. **Unauthenticated Users**: Handled in `AuthView.tsx`.
   * **Login Tab**: Standard email & password authentication via `signInWithEmailAndPassword`.
   * **Register Clinic Tab**: `registerClinic` performs an atomic setup:
     * Creates Firebase Auth user.
     * Generates a new `clinics` record with default branch (`MAIN`), basic tier, and default settings.
     * Generates an admin user record in `users/{uid}`.
     * Generates a default `providers` entry and default `operatories` (Chair 1).
   * **Reset Password**: Modal sends password reset email via `sendPasswordResetEmail`.
2. **Onboarding Flow**:
   * If `clinic.isOnboarded == false`, user is redirected to `OnboardingFlow.tsx`.
   * Step 1: Practice details, country selection, currency.
   * Step 2: Clinic branch location and operatory rooms count.
   * Step 3: Provider profiles and dental specialties.
   * Upon completion, sets `clinic.isOnboarded = true`.

### 7.2 Calendar & Scheduling Engine (`ScheduleView.tsx`)
* **Operatory Grid**: Displays treatment chairs as vertical columns side by side.
* **Time Scale**: Daily calendar spanning 8:00 AM to 6:00 PM (30-minute intervals).
* **Booking with Conflict Detection**:
  * Prevents double-booking: Checks if provider OR operatory is already occupied during the requested time window.
  * Auto-generates patient notification: If UltraMsg WhatsApp is configured, sending booking confirmation is offered immediately.
* **Status Pipeline**:
  `scheduled` ➔ `confirmed` ➔ `checked_in` ➔ `in_chair` ➔ `completed` (or `cancelled` / `no_show`).

### 7.3 The Chairside Clinical Workspace (`VisitWorkspaceView.tsx` & `OdontogramView.tsx`)
This is the core clinical module of Dentora:
1. **Starting a Visit (`startVisit(appointmentId)`)**:
   * Changes appointment status to `in_chair`.
   * Sets `activeVisitAppointmentId = appointmentId`.
   * Selects the patient and opens `VisitWorkspaceView`.
2. **Interactive 32-Tooth Odontogram (`CustomOdontogram.tsx`)**:
   * Displays all 32 adult teeth (Universal numbering #1 to #32 with FDI conversion #11 to #48).
   * **Surface Selector**: Allows fine-grained selection of tooth surfaces (`O`, `M`, `D`, `B`, `L`, `I`) or full tooth.
   * **Diagnosis & Finding**: Allows marking Caries, Fracture, Abscess, Missing, or Watch.
   * **Smart Rule-Based Suggestions**:
     * Caries on tooth ➔ suggests Composite, Amalgam, Inlay/Onlay, RCT, Crown.
     * Missing tooth ➔ suggests Implant, Bridge, Denture, Space Maintainer.
     * Abscess ➔ suggests RCT, Apicoectomy, Extraction, Bone Graft.
   * **History Isolation**: Shows currently recorded findings in this visit distinctly from past visits.
3. **DeepSeek AI Clinical Scribe**:
   * Dentists click **"Draft SOAP Note"**.
   * System collects all `ToothCondition` items charted during the active visit.
   * Calls `generateSOAPNote` in `src/lib/deepseek.ts`.
   * DeepSeek returns a structured JSON payload:
     ```json
     {
       "subjective": "Patient presents for routine restoration...",
       "objective": "Caries detected on Tooth #19 Occlusal-Distal...",
       "assessment": "Dental caries, localized to enamel and dentin.",
       "plan": "Resin-based composite restoration placed under local anesthesia..."
     }
     ```
   * Populates 2x2 grid for review and digital signature.
4. **Post-Save Delivery Modal**:
   * Once signed, a modal offers immediate PDF Clinical Record download or direct WhatsApp document delivery to the patient's phone.
5. **Completing a Visit (`completeVisit()`)**:
   * Sets appointment status to `completed`.
   * Clears `activeVisitAppointmentId`.
   * Navigates to Patient Ledger with `pendingInvoiceDate` set to prompt immediate invoice generation.

### 7.4 Billing, Invoicing & Financials (`InvoiceManagementView.tsx` & `InvoiceGeneratorModal.tsx`)
1. **Invoice Auto-Population**:
   * Automatically pulls newly completed procedures from the visit workspace.
   * Matches procedures to `clinicServices` catalog prices.
2. **Calculations**:
   * Calculates subtotal.
   * Supports fixed amount discount (e.g., -Rs. 500) or percentage discount (e.g., -10%).
   * Calculates Grand Total.
3. **Payment Methods**:
   * Cash, Card, Bank Transfer, JazzCash, EasyPaisa.
4. **Outputs & Delivery**:
   * **Download PDF**: Formatted professional invoice with clinic logo, patient chart number, line items, and tax ID.
   * **Send via WhatsApp**: UltraMsg delivers the base64 invoice directly to the patient's phone.
   * **Print**: Silent browser printing via hidden iframe.

---

## 8. Third-Party Integrations Detail

### 8.1 Firebase (`src/lib/firebase.ts`)
* Uses Firebase Web v11 SDK with modular imports (`getAuth`, `getFirestore`).
* Configuration loaded strictly from `import.meta.env.VITE_FIREBASE_*`.

### 8.2 DeepSeek API (`src/lib/deepseek.ts`)
* Endpoint: `https://api.deepseek.com/v1/chat/completions`
* Model: `deepseek-chat`
* Temperature: `0.2` (enforces strict clinical consistency)
* Response Format: `{ "type": "json_object" }` (guarantees valid JSON without conversational wrappers)
* Uses `VITE_DEEPSEEK_API_KEY`.

### 8.3 UltraMsg WhatsApp Gateway (`src/lib/ultramsg.ts`)
* Endpoint: `https://api.ultramsg.com/{instanceId}/messages/chat` & `/document`
* Features:
  * Phone number cleaner & international formatter (`formatPhoneForWhatsApp`).
  * Dynamic template variable replacement:
    `{PatientName}`, `{ClinicName}`, `{Date}`, `{Time}`.
  * Base64 PDF transmission for invoices and clinical charts.
* Credentials can be set globally in `.env` OR overridden per clinic in Practice Settings.

### 8.4 jsPDF Document Generator (`src/lib/pdfGenerator.ts`)
* Generates vector PDFs with:
  * Clinic logo image conversion to base64 via HTML5 Canvas.
  * Brand accent colors (Teal #0F766E).
  * AutoTable grid styling for line items.
  * Dual mode: Downloads `.pdf` directly to disk OR returns base64 string for WhatsApp delivery.

### 8.5 ImgBB CDN (`src/lib/imgbb.ts`)
* Uploads image files to ImgBB REST API and returns direct URL for `clinic.logoUrl`.

---

## 9. Environment Variables Reference (`.env.example`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="dentora-practice.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="dentora-practice"
VITE_FIREBASE_STORAGE_BUCKET="dentora-practice.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"

# DeepSeek AI API Key (Clinical Scribe)
VITE_DEEPSEEK_API_KEY="sk-..."

# UltraMsg WhatsApp API (Default fallback)
VITE_ULTRAMSG_INSTANCE_ID="instance..."
VITE_ULTRAMSG_TOKEN="..."
```

---

## 10. Rules & Instructions for Future AI Feature PRDs

When drafting future Product Requirement Documents (PRDs) or implementing new features on this codebase, **any AI or engineer MUST follow these rules**:

1. **Strict Type Adherence**: Every new domain entity or property MUST be added to `src/types/dental.ts` with strict typing. Never use `any` in data models.
2. **Multi-Tenancy Isolation**: Every new Firestore collection or document MUST contain a `clinicId: string` field. Every Firestore query MUST filter by `where('clinicId', '==', currentClinicId)`.
3. **Real-Time State Sync**: If a feature requires persistent data, hook it into `DentoraContext.tsx` using `onSnapshot` listeners so all active tabs update in real time without manual re-fetching.
4. **Design System Consistency**:
   * Follow the minimalist "Vercel / Stripe" aesthetic.
   * Primary action color: Teal (`teal-600` / `hover:bg-teal-700`).
   * Backgrounds: `bg-[#F8FAFC]` or `bg-slate-50`.
   * Cards: `bg-white border border-slate-200/80 shadow-xs rounded-2xl`.
   * Micro-interactions: Framer motion `transition={{ type: "spring", stiffness: 400, damping: 30 }}`.
5. **No Regressions on Integrations**:
   * Keep phone numbers compatible with `formatPhoneForWhatsApp`.
   * Keep PDFs compatible with `jsPDF` dual download/base64 return pattern.
   * Keep AI prompts strictly schema-bound via JSON mode.
6. **Desktop Ergonomics**: Clinical charting requires large screen real estate; always respect the `MobileBlocker` component for charting views.

*(End of Master Architecture Specification)*
