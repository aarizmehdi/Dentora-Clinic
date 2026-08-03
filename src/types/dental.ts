export type UserRole = 'admin' | 'dentist' | 'hygienist' | 'front_desk';

export interface Location {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  operatoriesCount: number;
  operatingHours?: {
    open: string;
    close: string;
  };
}

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

export interface Clinic {
  id: string;
  name: string;
  isOnboarded?: boolean;
  taxId: string;
  currency?: string;
  country?: string;
  countryCode?: string;
  logoUrl?: string;
  locations: Location[];
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'past_due' | 'canceled';
  whatsappConfig?: WhatsAppConfig;
}

export interface User {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  locationIds: string[];
  avatarUrl?: string;
}

export interface Provider {
  id: string;
  clinicId: string;
  name: string;
  title: string; // e.g. D.D.S., D.M.D., R.D.H.
  specialty: string; // General, Ortho, Perio, Endodontics, Hygiene
  color: string; // UI calendar color accent
  locationIds: string[];
}

export interface Operatory {
  id: string;
  clinicId: string;
  name: string; // e.g., Op 1 - Restorative, Op 2 - Hygiene
  locationId: string;
  equipmentType: string;
  isHygiene: boolean;
}

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


export interface Patient {
  id: string;
  clinicId: string;
  chartNumber: string;
  firstName: string;
  lastName: string;
  dob: string;
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

export type ToothSurface = 'O' | 'M' | 'D' | 'B' | 'L' | 'I' | 'Root';

export type ToothConditionType = 
  | 'decay' 
  | 'amalgam' 
  | 'composite' 
  | 'crown' 
  | 'rct' 
  | 'implant' 
  | 'missing' 
  | 'extraction_needed' 
  | 'veneer' 
  | 'bridge' 
  | 'sealant' 
  | 'watch'
  | 'inlay_onlay'
  | 'post_core'
  | 'temporary_crown'
  | 'denture'
  | 'glass_ionomer'
  | 'surgical_extraction'
  | 'impacted'
  | 'bone_graft'
  | 'apicoectomy'
  | 'fracture'
  | 'srp'
  | 'fluoride'
  | 'abscess'
  | 'night_guard'
  | 'space_maintainer'
  | 'ortho_bracket';

export type ToothStatus = 'existing' | 'condition' | 'planned' | 'completed';

export interface ToothCondition {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string; // Links condition to a specific visit
  toothNumber: number; // 1 to 32 (Adult) or 51-85 / A-T
  surfaces: ToothSurface[];
  conditionType: ToothConditionType;
  status: ToothStatus;
  cdtCode?: string;
  description: string;
  date: string;
  providerId: string;
}

export interface CDTProcedure {
  code: string;
  category: 'Diagnostic' | 'Preventive' | 'Restorative' | 'Endodontics' | 'Periodontics' | 'Prosthodontics' | 'Oral Surgery' | 'Orthodontics';
  description: string;
  usualTimeMin: number;
}



export type PerioSite = 'MB' | 'B' | 'DB' | 'ML' | 'L' | 'DL';

export interface PerioToothDepth {
  toothNumber: number;
  depths: Record<PerioSite, number>; // e.g. MB: 3, B: 2, DB: 3
  bleeding: Record<PerioSite, boolean>;
  suppuration: Record<PerioSite, boolean>;
  mobility: 0 | 1 | 2 | 3;
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

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'checked_in' 
  | 'in_chair' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  providerId: string;
  operatoryId: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM 24h or 12h e.g., "09:00"
  endTime: string;   // "10:00"
  procedureCodes: string[]; // CDT codes
  procedureSummary: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface ClinicalSOAPNote {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string; // Links note to a specific visit
  date: string;
  providerId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isSigned: boolean;
}

export interface IntakeForm {
  id: string;
  clinicId: string;
  patientId: string;
  title: string;
  category: 'Medical History' | 'HIPAA Consent' | 'Financial Agreement' | 'COVID/Health Screening';
  status: 'completed' | 'pending';
  updatedAt: string;
}

export interface ClinicService {
  id: string;
  clinicId: string;
  name: string;
  defaultPrice: number;
}

export interface InvoiceItem {
  id: string;
  serviceId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string; // Links invoice to a specific visit
  date: string;
  items: InvoiceItem[];
  discountType: 'fixed' | 'percentage' | 'none';
  discountValue: number;
  subtotal: number;
  grandTotal: number;
  status: 'paid' | 'unpaid';
  paymentMethod?: 'Cash' | 'Card' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa';
  deliveryStatus?: 'pending' | 'sent' | 'printed';
  isFinalized: boolean;
}
