# Dentora - Clinic Management System Architecture & Documentation

This document serves as a comprehensive overview of the Dentora Dental Practice Management System. It is designed to provide full context to any AI or developer for the creation of future Product Requirement Documents (PRDs) and feature expansions.

## 1. Project Overview & Vision
**Dentora** is a premium, modern, single-page application (SPA) designed to manage dental clinics. It aims to replace clunky legacy dental software with a sleek, minimalist, "Vercel/Stripe-like" user experience. It leverages real-time cloud data, AI-powered automation, and seamless third-party integrations (WhatsApp, PDF generation) to streamline practice workflows.

## 2. Technology Stack
*   **Frontend Framework**: React 19 (via Vite)
*   **Language**: TypeScript (Strict typing for robust state management)
*   **Styling**: Tailwind CSS v4, Vanilla CSS (`index.css` for custom scrollbars and utility classes)
*   **Animations**: Framer Motion & Motion (Micro-interactions, page transitions, glassmorphic UI)
*   **Icons**: Lucide React
*   **Backend & Database**: Firebase (Authentication, Firestore NoSQL Database)
*   **PDF Generation**: `jspdf` and `jspdf-autotable`
*   **AI Integration**: DeepSeek API (for automated Clinical SOAP Notes)
*   **Messaging**: UltraMsg API (WhatsApp integration for text and PDF documents)
*   **Image Hosting**: ImgBB API (for Clinic Logos)
*   **Dental Specific Packages**: `react-odontogram`, `react-teeth-selector`

## 3. Data Architecture & State Management (Firestore & React Context)
The app uses a **Multi-Tenant Architecture**, where every piece of data is scoped to a specific `clinicId`. 
Global state is managed via a massive context provider in `src/context/DentoraContext.tsx`. 

### State Management Approach
*   **Real-time Sync**: `DentoraContext` uses Firebase `onSnapshot` listeners to subscribe to collections (`patients`, `appointments`, `operatories`, `invoices`, etc.) where `clinicId == currentClinicId`.
*   **Global Access**: Any component can access the entire state using the `useDentora()` hook.
*   **Local Caching**: Data is kept in React state arrays, providing instant UI updates.
*   **Auth State**: Handled natively by Firebase `onAuthStateChanged`, determining if the user goes to `AuthView`, `OnboardingFlow`, or `AppContent`.

### Core Data Models (src/types/dental.ts)
1.  **Clinic**: The root tenant. Contains `id`, `name`, `taxId`, `subscriptionTier`, array of `locations` (for multi-branch support), and `whatsappConfig`.
2.  **User**: System users (Admin, Dentist, Hygienist, Front Desk) linked to a `clinicId`.
3.  **Provider**: The clinical staff (Dentists, Hygienists) who perform procedures.
4.  **Operatory**: The physical chairs/rooms where appointments take place.
5.  **Patient**: Patient demographics, medical alerts, assigned providers, and family relationships.
6.  **Appointment**: Scheduled visits tied to a `patientId`, `providerId`, `operatoryId`, and `locationId`. Tracks statuses (`scheduled`, `in_chair`, `completed`).
7.  **ToothCondition**: Represents a charted procedure/finding. Contains `toothNumber`, `surfaces`, `conditionType`, `status` (`existing`, `planned`, `completed`), and `cdtCode`.
8.  **PerioExam**: Periodontal probing depths, bleeding, and mobility for a specific patient visit.
9.  **ClinicalSOAPNote**: Subjective, Objective, Assessment, Plan notes, tied to a patient and appointment.
10. **ClinicService**: Practice fee schedule/catalog (e.g., Consultation, RCT, Extraction with default prices).
11. **Invoice**: Billing records, containing line items (`InvoiceItem`), subtotals, discounts, grand total, and payment status.

## 4. Core Features & Module Breakdown

### 4.1 Authentication & Onboarding
*   **Component**: `AuthView.tsx`, `OnboardingFlow.tsx`
*   **Details**: Supports Email/Password login and registration. Includes a "Forgot Password" flow. New clinics are routed to `OnboardingFlow` to set up practice details, locations, and initial providers.

### 4.2 Dashboard (`DashboardView.tsx`)
*   **Details**: High-level overview. Shows metrics like Today's Patients, Revenue, Active Appointments. Includes quick actions (New Patient, New Appointment).

### 4.3 Schedule (`ScheduleView.tsx`)
*   **Details**: An Operatory-based daily calendar view. Columns represent physical operatories. Drag-and-drop mechanics (conceptually), visual color-coding based on Provider or Status. Modal `NewAppointmentModal.tsx` integrates WhatsApp to send instant booking confirmations.

### 4.4 Patient Management (`PatientList.tsx`, `PatientDetailView.tsx`)
*   **Details**: 
    *   **Overview**: Demographics and upcoming appointments.
    *   **Medical Alerts**: Visual red flags for severe conditions.
    *   **Visit History**: Timeline of past appointments, signed notes, and completed procedures. Can generate full Clinical Record PDFs via `pdfGenerator.ts`.
    *   **Billing**: Patient-specific ledger.

### 4.5 Charting & Visit Workspace (`VisitWorkspaceView.tsx`, `OdontogramView.tsx`, `PerioChartView.tsx`)
*   **Details**: The core clinical engine.
    *   **Odontogram**: Visual 3D tooth chart (`react-teeth-selector` + custom SVG overlays). Allows charting of conditions (decay, amalgam, implants) on specific tooth surfaces.
    *   **Perio Charting**: Records probing depths (1-9mm), bleeding, suppuration, and mobility per tooth site.
    *   **SOAP Notes**: Clinical notes editor. Includes a magical "Generate with DeepSeek AI" button that reads the current charted procedures and writes a professional medical narrative.

### 4.6 Billing & Invoicing (`InvoiceManagementView.tsx`, `InvoiceGeneratorModal.tsx`)
*   **Details**: 
    *   Generates invoices pulling from `ClinicService` catalog or manually entered items.
    *   Applies percentage or fixed discounts.
    *   Generates a highly polished PDF invoice (`generateInvoicePDF`).
    *   Integrates with UltraMsg to deliver the PDF directly to the patient's WhatsApp.

### 4.7 Practice Settings (`PracticeSettingsView.tsx`)
*   **Details**: Admin panel to configure:
    *   Practice Details & Logo Upload (via ImgBB).
    *   User and Provider management.
    *   Service/Fee Schedule catalog.
    *   UltraMsg WhatsApp API credentials configuration.

## 5. UI/UX Design System
*   **Layout**: Sidebar navigation (`Sidebar.tsx`), top search/profile bar (`Navbar.tsx`), main scrollable content area.
*   **Aesthetic**: "Vercel / Stripe vibe". Minimalist, clean. Heavy use of whites/grays (`bg-slate-50`), soft drop shadows (`shadow-sm`, `shadow-md`), thin borders (`border-slate-200`), and rounded corners (`rounded-xl`, `rounded-2xl`).
*   **Brand Color**: Teal (`teal-600` for primary actions).
*   **Animations**: `framer-motion` is used extensively for smooth page transitions, modal pop-ups, drawer slides, and micro-interactions (e.g., background hover states, toast notifications).
*   **Responsiveness**: Uses Tailwind's mobile-first breakpoints (`sm:`, `md:`, `lg:`), though a `MobileBlocker.tsx` is implemented for extremely small screens since clinical charts require desktop space.

## 6. Integrations Context
*   **Firebase**: All standard Firebase web SDKs are used. Rules should secure `clinicId` access.
*   **PDF Generation**: `src/lib/pdfGenerator.ts` abstracts `jspdf`. It creates custom-designed, branded letterheads for Clinical Records and Invoices.
*   **UltraMsg**: `src/lib/ultramsg.ts`. A WhatsApp REST API wrapper. Can send raw text messages (Reminders) or base64 PDF documents (Invoices).
*   **DeepSeek**: `src/lib/deepseek.ts`. Hits `https://api.deepseek.com/v1/chat/completions` using a strict JSON format to turn raw clinical findings into structured SOAP notes.
*   **ImgBB**: `src/lib/imgbb.ts`. Uploads clinic logos directly to ImgBB and returns the URL.

## 7. Future Considerations for PRDs
When generating future PRDs, the AI should assume:
1.  **Strict Typing**: Any new feature must be strictly typed in `types/dental.ts`.
2.  **Context Sync**: New collections must be hooked up to `DentoraContext.tsx` via `onSnapshot` if they need real-time UI updates.
3.  **Multi-Tenancy**: All database operations **MUST** include `clinicId`.
4.  **Aesthetics First**: Any new UI component must adhere to the Vercel/Stripe minimalist design system (Tailwind). No clunky UI elements.

*(End of Documentation)*
