import React, { useState, useEffect } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { CustomOdontogram } from './CustomOdontogram';
import {
  Activity,
  FileText,
  Sparkles,
  Loader2,
  FileDown,
  X,
  Search,
  ChevronRight,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { ToothSurface, ToothConditionType, ToothStatus } from '../../types/dental';
import { generateSOAPNote } from '../../lib/deepseek';
import { generateClinicalRecord } from '../../lib/pdfGenerator';
import { sendWhatsAppDocument, formatPhoneForWhatsApp } from '../../lib/ultramsg';
import { motion, AnimatePresence } from 'framer-motion';

// --- TREATMENT LIBRARY ---
const TREATMENT_LIBRARY = [
  { id: 'composite', name: 'Composite', code: 'D2392', category: 'Restorative', color: 'bg-teal-500' },
  { id: 'amalgam', name: 'Amalgam', code: 'D2150', category: 'Restorative', color: 'bg-slate-400' },
  { id: 'glass_ionomer', name: 'Glass Ionomer', code: 'D2390', category: 'Restorative' },
  { id: 'inlay_onlay', name: 'Inlay/Onlay', code: 'D2642', category: 'Restorative' },
  { id: 'post_core', name: 'Post & Core', code: 'D2952', category: 'Restorative' },
  { id: 'crown', name: 'Crown', code: 'D2750', category: 'Prosthodontics', color: 'bg-amber-500' },
  { id: 'temporary_crown', name: 'Temp Crown', code: 'D2799', category: 'Prosthodontics' },
  { id: 'bridge', name: 'Bridge', code: 'D6240', category: 'Prosthodontics', color: 'bg-blue-500' },
  { id: 'veneer', name: 'Veneer', code: 'D2962', category: 'Prosthodontics' },
  { id: 'implant', name: 'Implant', code: 'D6010', category: 'Prosthodontics', color: 'bg-indigo-500' },
  { id: 'denture', name: 'Denture', code: 'D5110', category: 'Prosthodontics', description: 'Denture (Partial/Full)' },
  { id: 'extraction_needed', name: 'Simple Ext', code: 'D7140', category: 'Surgery & Endo', color: 'bg-rose-500' },
  { id: 'surgical_extraction', name: 'Surgical Ext', code: 'D7210', category: 'Surgery & Endo' },
  { id: 'impacted', name: 'Impacted Ext', code: 'D7240', category: 'Surgery & Endo' },
  { id: 'bone_graft', name: 'Bone Graft', code: 'D7953', category: 'Surgery & Endo' },
  { id: 'rct', name: 'Root Canal', code: 'D3330', category: 'Surgery & Endo', color: 'bg-purple-500' },
  { id: 'apicoectomy', name: 'Apicoectomy', code: 'D3410', category: 'Surgery & Endo' },
  { id: 'sealant', name: 'Sealant', code: 'D1351', category: 'Preventive & Appliances' },
  { id: 'srp', name: 'SRP', code: 'D4341', category: 'Preventive & Appliances', description: 'SRP Quadrant' },
  { id: 'fluoride', name: 'Fluoride', code: 'D1206', category: 'Preventive & Appliances', description: 'Fluoride Varnish' },
  { id: 'night_guard', name: 'Night Guard', code: 'D9944', category: 'Preventive & Appliances', description: 'Night Guard / Splint' },
  { id: 'space_maintainer', name: 'Space Maintainer', code: 'D1510', category: 'Preventive & Appliances' }
];

const MASTER_ORDER = [
  'fluoride', 'sealant', 'composite', 'glass_ionomer', 'amalgam', 'inlay_onlay', 
  'rct', 'apicoectomy', 'post_core', 'crown', 'implant', 'bridge', 'denture', 
  'space_maintainer', 'extraction_needed', 'surgical_extraction', 'bone_graft'
];

// FDI & Clinical Helpers
const getFDI = (univ: number) => {
  if (univ >= 1 && univ <= 8) return 19 - univ;
  if (univ >= 9 && univ <= 16) return 20 + (univ - 8);
  if (univ >= 17 && univ <= 24) return 30 + (25 - univ);
  if (univ >= 25 && univ <= 32) return 40 + (univ - 24);
  return univ;
};

const getQuadrantInfo = (univ: number) => {
  if (univ >= 1 && univ <= 8) return "Upper Right (Q1)";
  if (univ >= 9 && univ <= 16) return "Upper Left (Q2)";
  if (univ >= 17 && univ <= 24) return "Lower Left (Q3)";
  return "Lower Right (Q4)";
};

const getToothType = (univNum: number) => {
  if (univNum >= 1 && univNum <= 3) return "Upper Right Molar";
  if (univNum >= 4 && univNum <= 5) return "Upper Right Premolar";
  if (univNum >= 6 && univNum <= 8) return "Upper Right Canine/Incisor";
  if (univNum >= 9 && univNum <= 11) return "Upper Left Canine/Incisor";
  if (univNum >= 12 && univNum <= 13) return "Upper Left Premolar";
  if (univNum >= 14 && univNum <= 16) return "Upper Left Molar";
  if (univNum >= 17 && univNum <= 19) return "Lower Left Molar";
  if (univNum >= 20 && univNum <= 21) return "Lower Left Premolar";
  if (univNum >= 22 && univNum <= 24) return "Lower Left Canine/Incisor";
  if (univNum >= 25 && univNum <= 27) return "Lower Right Canine/Incisor";
  if (univNum >= 28 && univNum <= 29) return "Lower Right Premolar";
  return "Lower Right Molar";
};



export const OdontogramView: React.FC = () => {
  const {
    selectedPatient,
    patients,
    selectPatient,
    providers,
    currentUser,
    clinic,
    toothConditions,
    addToothCondition,
    removeToothCondition,
    soapNotes,
    addSOAPNote,
    showToast,
    activeVisitAppointmentId,
  } = useDentora();

  const [selectedTooth, setSelectedTooth] = useState<number>(19); // Default Tooth #19
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>([]);
  const [activeStatus, setActiveStatus] = useState<ToothStatus>('condition');
  const [patientSearch, setPatientSearch] = useState('');

  // SOAP Note state
  const [isManualDraft, setIsManualDraft] = useState(false);
  const [showPDFPrompt, setShowPDFPrompt] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [whatsappStatus, setWhatsappStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [justSignedNoteData, setJustSignedNoteData] = useState<any>(null);
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  // Custom Tooltip State
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showToothHistory, setShowToothHistory] = useState(false);
  const [showAdvancedTreatments, setShowAdvancedTreatments] = useState(false);

  useEffect(() => {
    setShowToothHistory(false);
  }, [selectedTooth]);

  if (!selectedPatient) {
    const isSearching = patientSearch.trim().length > 0;
    const filteredPatients = patients.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.chartNumber.toLowerCase().includes(patientSearch.toLowerCase())
    );
    const displayPatients = isSearching ? filteredPatients.slice(0, 5) : patients.slice(-5).reverse();

    return (
      <div className="flex flex-col w-full max-w-2xl mx-auto py-12 px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Select Patient</h2>
          <p className="text-slate-500 text-sm mt-2">Search by name or chart number to begin charting.</p>
        </div>

        <div className="relative mb-8 group shadow-sm rounded-xl">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="Search patients..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="w-full">
          {displayPatients.length > 0 && (
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
              {isSearching ? 'Search Results' : 'Recent Patients'}
            </h3>
          )}
          
          <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {displayPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No patients found.</div>
            ) : (
              displayPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  onClick={() => selectPatient(patient.id)}
                  className={`flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    index !== displayPatients.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {patient.avatar ? (
                      <img src={patient.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-semibold text-sm border border-slate-200">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {patient.firstName} {patient.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {patient.chartNumber} • DOB: {patient.dob}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const patientConditions = toothConditions.filter(c => c.patientId === selectedPatient.id);
  
  // Filter to only show conditions charted in the current active visit (or today if no active visit)
  const displayConditions = patientConditions.filter(c => {
    if (activeVisitAppointmentId) return c.appointmentId === activeVisitAppointmentId;
    return c.date === new Date().toISOString().split('T')[0];
  });

  const currentVisitConditions = patientConditions.filter(c => c.appointmentId === activeVisitAppointmentId && activeVisitAppointmentId);
  const historicalConditions = patientConditions.filter(c => c.appointmentId !== activeVisitAppointmentId || !activeVisitAppointmentId);
  
  // Note: activeToothConditions are just those on the selected tooth
  const currentToothConditions = currentVisitConditions.filter(c => c.toothNumber === selectedTooth);
  const historicalToothConditionsForTooth = historicalConditions.filter(c => c.toothNumber === selectedTooth);

  const getToothName = (num: number) => {
    if (num >= 1 && num <= 3) return `Upper Right Molar (#${num})`;
    if (num >= 4 && num <= 5) return `Upper Right Premolar (#${num})`;
    if (num >= 6 && num <= 8) return `Upper Right Anterior (#${num})`;
    if (num >= 9 && num <= 11) return `Upper Left Anterior (#${num})`;
    if (num >= 12 && num <= 13) return `Upper Left Premolar (#${num})`;
    if (num >= 14 && num <= 16) return `Upper Left Molar (#${num})`;
    if (num >= 17 && num <= 19) return `Lower Left Molar (#${num})`;
    if (num >= 20 && num <= 21) return `Lower Left Premolar (#${num})`;
    if (num >= 22 && num <= 24) return `Lower Left Anterior (#${num})`;
    if (num >= 25 && num <= 27) return `Lower Right Anterior (#${num})`;
    if (num >= 28 && num <= 29) return `Lower Right Premolar (#${num})`;
    return `Lower Right Molar (#${num})`;
  };

  const toggleSurface = (surf: ToothSurface) => {
    if (selectedSurfaces.includes(surf)) {
      setSelectedSurfaces(selectedSurfaces.filter(s => s !== surf));
    } else {
      setSelectedSurfaces([...selectedSurfaces, surf]);
    }
  };

  const handleApplyProcedure = (condType: ToothConditionType, cdtCode?: string, desc = '') => {
    addToothCondition({
      patientId: selectedPatient.id,
      toothNumber: selectedTooth,
      surfaces: selectedSurfaces,
      conditionType: condType,
      status: activeStatus,
      cdtCode,
      description: desc || `${condType.toUpperCase()} on Tooth #${selectedTooth} (${selectedSurfaces.join('')})`,
      date: new Date().toISOString().split('T')[0],
      providerId: currentUser?.id || 'sys',
      appointmentId: activeVisitAppointmentId || undefined,
    });
    setSelectedSurfaces([]);
  };

  const handleAutoGenerateSOAP = async () => {
    if (currentVisitConditions.length === 0) {
      showToast('Error', 'No new clinical findings recorded in this visit to generate a note from.');
      return;
    }

    setIsGeneratingNote(true);
    try {
      // DeepSeek gets ONLY the current visit's findings!
      const toothDescs = currentVisitConditions.map(c => `Tooth #${c.toothNumber} (${c.surfaces.join('') || 'Full'}): ${c.description}`).join('; ');

      const aiNote = await generateSOAPNote(
        `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        toothDescs
      );

      setSubjective(aiNote.subjective);
      setObjective(aiNote.objective);
      setAssessment(aiNote.assessment);
      setPlan(aiNote.plan);
      
      showToast('AI Scribe Complete', 'SOAP progress note compiled successfully from odontogram findings.');
    } catch (err: any) {
      console.error(err);
      showToast('AI Error', err.message || 'Failed to generate note via DeepSeek.');
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleSaveSOAP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjective || !plan) return;
    
    const noteData = {
      patientId: selectedPatient.id,
      date: new Date().toISOString().split('T')[0],
      providerId: currentUser?.id || 'sys',
      subjective,
      objective,
      assessment,
      plan,
      isSigned: true,
      appointmentId: activeVisitAppointmentId || undefined,
    };
    
    addSOAPNote(noteData);
    setJustSignedNoteData(noteData);

    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setIsManualDraft(false);
    showToast('Note Saved', 'SOAP note digitally signed and added to history.');    
    setPdfStatus('idle');
    setWhatsappStatus('idle');
    setShowPDFPrompt(true);
  };

  const handleHoverTooth = (tooth: number | null, e: React.MouseEvent) => {
    setHoveredTooth(tooth);
    if (tooth !== null) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };


  return (
    <>
      <div className="flex flex-col w-full mx-auto gap-6">
      
      {/* WORKSTATION GRID */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Chart Card */}
        <div className="flex-[7] bg-white border border-slate-200 shadow-xs rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">Restorative Odontogram</h2>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Caries</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500" /> Composite</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Crown</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> RCT</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-800" /> Missing</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 flex flex-col items-center justify-center relative w-full min-h-[320px]" onMouseLeave={() => setHoveredTooth(null)}>
            <div className="w-full flex items-center justify-center">
              <CustomOdontogram 
                selectedTooth={selectedTooth}
                selectedSurfaces={selectedSurfaces}
                onSelectTooth={(toothNum) => {
                  setSelectedTooth(toothNum);
                  setSelectedSurfaces([]);
                }}
                onHoverTooth={handleHoverTooth}
                toothConditions={displayConditions}
                patientId={selectedPatient.id}
              />
            </div>

            {/* Custom Interactive Tooltip */}
            {hoveredTooth && (
              <div 
                className="fixed z-[99999] bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] border border-slate-700"
                style={{ left: mousePos.x, top: mousePos.y }}
              >
                <div className="text-xs min-w-[130px]">
                  <div className="font-bold text-teal-400">Tooth #{hoveredTooth} (FDI #{getFDI(hoveredTooth)})</div>
                  <div className="text-[11px] text-slate-300 font-medium">{getToothType(hoveredTooth)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{getQuadrantInfo(hoveredTooth)}</div>
                </div>
                <div className="absolute w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900 left-1/2 bottom-[-5px] transform -translate-x-1/2"></div>
              </div>
            )}
          </div>
        </div>

        {/* Guided Clinical Workflow */}
        <div className="flex-[3] bg-white border border-slate-200 shadow-xs rounded-2xl flex flex-col overflow-hidden">
          
          {/* Header: Active Tooth Context */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">Charting</span>
                <h3 className="text-sm font-bold text-slate-900">{getToothName(selectedTooth)}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">FDI #{getFDI(selectedTooth)}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Click a tooth on the chart to begin</p>
          </div>

          <div className="h-full">
            <div className="p-4 space-y-5">
            {/* ── STEP 1: Surfaces (Optional) ── */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                <span className="text-[11px] font-bold text-slate-800">Select Surfaces</span>
                <span className="text-[10px] text-slate-400 italic ml-auto">optional</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2 ml-7">Pick affected surfaces, or skip for full-tooth procedures like Crown or Missing.</p>
              <div className="grid grid-cols-3 gap-1 ml-7">
                {[
                  { key: 'O', label: 'Occlusal' },
                  { key: 'M', label: 'Mesial' },
                  { key: 'D', label: 'Distal' },
                  { key: 'B', label: 'Buccal' },
                  { key: 'L', label: 'Lingual' },
                ].map(surf => {
                  const isChecked = selectedSurfaces.includes(surf.key as ToothSurface);
                  return (
                    <button
                      key={surf.key}
                      onClick={() => toggleSurface(surf.key as ToothSurface)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                        isChecked 
                          ? 'bg-teal-600 text-white border-teal-600' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {surf.label}
                    </button>
                  );
                })}
              </div>
              {selectedSurfaces.length > 0 && (
                <div className="flex items-center justify-between mt-2 ml-7">
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Selected: {selectedSurfaces.join(', ')}
                  </span>
                  <button onClick={() => setSelectedSurfaces([])} className="text-[10px] text-slate-400 font-semibold hover:text-rose-500">
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* ── STEP 2: Record Finding ── */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                <span className="text-[11px] font-bold text-slate-800">Record Finding</span>
              </div>


              {/* Diagnoses */}
              <div className="ml-7 mb-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Diagnoses / State</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-7">
                <button 
                  onClick={() => handleApplyProcedure('decay', 'D2391', `Caries Tooth #${selectedTooth} (${selectedSurfaces.join('') || 'Full'})`)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  Caries
                </button>
                <button 
                  onClick={() => handleApplyProcedure('fracture', 'D0000', `Fracture Tooth #${selectedTooth}`)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  Fracture
                </button>
                <button 
                  onClick={() => handleApplyProcedure('abscess', 'D0000', `Abscess Tooth #${selectedTooth}`)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-700 shrink-0" />
                  Abscess
                </button>
                <button 
                  onClick={() => handleApplyProcedure('missing', 'D7140', `Missing Tooth #${selectedTooth}`)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                  Missing
                </button>
                <button 
                  onClick={() => handleApplyProcedure('watch', 'D0000', `Watch Tooth #${selectedTooth}`)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  Watch
                </button>
              </div>

              {/* Rule-Based Smart Suggestions */}
              {(() => {
                const activeDiagnoses = currentToothConditions.map(c => c.conditionType);
                if (!activeDiagnoses.some(d => ['decay', 'fracture', 'abscess', 'missing', 'watch'].includes(d))) return null;

                const suggestedSet = new Set<string>();
                if (activeDiagnoses.includes('decay')) {
                  ['composite', 'glass_ionomer', 'amalgam', 'inlay_onlay', 'rct', 'post_core', 'crown', 'extraction_needed'].forEach(t => suggestedSet.add(t));
                }
                if (activeDiagnoses.includes('missing')) {
                  ['implant', 'bridge', 'denture', 'space_maintainer'].forEach(t => suggestedSet.add(t));
                }
                if (activeDiagnoses.includes('fracture')) {
                  ['composite', 'inlay_onlay', 'crown', 'rct', 'post_core', 'extraction_needed', 'surgical_extraction'].forEach(t => suggestedSet.add(t));
                }
                if (activeDiagnoses.includes('abscess')) {
                  ['rct', 'apicoectomy', 'extraction_needed', 'surgical_extraction', 'bone_graft'].forEach(t => suggestedSet.add(t));
                }
                if (activeDiagnoses.includes('watch')) {
                  ['fluoride', 'sealant'].forEach(t => suggestedSet.add(t));
                }

                const suggestedArr = Array.from(suggestedSet).sort((a, b) => {
                  const idxA = MASTER_ORDER.indexOf(a);
                  const idxB = MASTER_ORDER.indexOf(b);
                  return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
                });

                return (
                  <div className="ml-7 mt-4 bg-teal-50/50 border border-teal-100 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3 h-3" />
                      Suggested Treatments
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestedArr.map(id => {
                        const t = TREATMENT_LIBRARY.find(tr => tr.id === id);
                        if (!t) return null;
                        const desc = t.description || `${t.name} Tooth #${selectedTooth}` + (['composite', 'amalgam'].includes(t.id) ? ` (${selectedSurfaces.join('') || 'Full'})` : '');
                        return (
                          <button 
                            key={`sugg-${t.id}`}
                            onClick={() => handleApplyProcedure(t.id as any, t.code, desc)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-teal-200 hover:bg-teal-100 text-teal-900 transition-all active:scale-95 bg-white shadow-sm"
                          >
                            {t.color && <span className={`w-1.5 h-1.5 rounded-full ${t.color}`} />}
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Advanced Treatments Toggle */}
              <div className="ml-7 mt-4">
                <button 
                  onClick={() => setShowAdvancedTreatments(!showAdvancedTreatments)}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ChevronRight className={`w-3 h-3 transition-transform ${showAdvancedTreatments ? 'rotate-90' : ''}`} />
                  {showAdvancedTreatments ? 'Hide All Treatments' : 'Show Advanced Treatments'}
                </button>
              </div>

              {/* Full Clinical Procedures Database */}
              {showAdvancedTreatments && (
                <div className="ml-7 mt-3 space-y-4 border-l-2 border-slate-100 pl-3">
                  {['Restorative', 'Prosthodontics', 'Surgery & Endo', 'Preventive & Appliances'].map(category => (
                    <div key={category}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{category}</span>
                      <div className="flex flex-wrap gap-2">
                        {TREATMENT_LIBRARY.filter(t => t.category === category).map(t => {
                          const desc = t.description || `${t.name} Tooth #${selectedTooth}` + (['composite', 'amalgam'].includes(t.id) ? ` (${selectedSurfaces.join('') || 'Full'})` : '');
                          return (
                            <button 
                              key={`full-${t.id}`}
                              onClick={() => handleApplyProcedure(t.id as any, t.code, desc)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all active:scale-95 bg-white"
                            >
                              {t.color && <span className={`w-1.5 h-1.5 rounded-full ${t.color}`} />}
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Inline Summary ── */}
            {(currentToothConditions.length > 0 || historicalToothConditionsForTooth.length > 0) && (
              <>
                <div className="h-px bg-slate-100" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">✓</span>
                    <span className="text-[11px] font-bold text-slate-800">Recorded on this tooth</span>
                  </div>
                  
                  {currentToothConditions.length === 0 && historicalToothConditionsForTooth.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5 border border-dashed border-slate-200 rounded ml-7">None</span>
                  ) : (
                    <div className="flex flex-col gap-1 mt-1 ml-7">
                      {/* Current Visit Conditions */}
                      {currentToothConditions.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-1.5 rounded-md border border-teal-100">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{c.description}</span>
                            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                              {c.date} • {c.providerId === currentUser?.id ? 'You' : 'Provider'}
                            </span>
                          </div>
                          <button 
                            onClick={() => removeToothCondition(c.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Historical Conditions Button & List */}
                      {historicalToothConditionsForTooth.length > 0 && (
                        <div className="mt-2">
                          <button 
                            onClick={() => setShowToothHistory(!showToothHistory)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md transition-colors w-max"
                          >
                            {showToothHistory ? 'Hide Past Treatments' : `View Past Treatments (${historicalToothConditionsForTooth.length})`}
                          </button>
                          
                          {showToothHistory && (
                            <div className="flex flex-col gap-1 mt-2 border-l-2 border-slate-200 pl-2">
                              {historicalToothConditionsForTooth.map(c => (
                                <div key={c.id} className="flex items-center justify-between text-[10px] bg-slate-50/50 px-2 py-1.5 rounded-md border border-slate-100">
                                  <div className="flex flex-col opacity-70">
                                    <span className="font-bold text-slate-600">{c.description}</span>
                                    <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                                      {c.date} • {c.providerId === currentUser?.id ? 'You' : 'Provider'}
                                      <span className="ml-1 text-[8px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded font-black tracking-wider uppercase">Historical</span>
                                    </span>
                                  </div>
                                  {/* NO DELETE BUTTON FOR HISTORICAL ITEMS */}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      </div>

      {/* ── CLINICAL DOCUMENTATION ── */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl flex flex-col overflow-hidden">
        
        {/* Header with guided context */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Progress Note</h3>
                <p className="text-[11px] text-slate-400">Document your clinical findings for this visit</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col p-5">
          {!isManualDraft && !subjective && !plan ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-purple-500" />
              </div>
              <p className="text-base font-bold text-slate-900 mb-1">AI Clinical Scribe</p>
              <p className="text-xs text-slate-500 max-w-md mb-1">
                Let AI read your charted findings and draft a complete SOAP progress note in seconds.
              </p>
              {currentVisitConditions.length === 0 ? (
                <p className="text-[11px] text-amber-600 font-semibold mb-4">⚠ Chart at least one finding in this visit to generate a note.</p>
              ) : (
                <p className="text-[11px] text-teal-600 font-semibold mb-4">✓ {currentVisitConditions.length} finding{currentVisitConditions.length !== 1 ? 's' : ''} recorded in this visit — ready to draft.</p>
              )}
              <button 
                onClick={handleAutoGenerateSOAP} 
                disabled={isGeneratingNote || patientConditions.length === 0} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isGeneratingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGeneratingNote ? 'Drafting Note...' : 'Draft SOAP Note'}
              </button>
              <button onClick={() => setIsManualDraft(true)} className="text-[11px] text-slate-400 hover:text-slate-600 mt-4 underline transition-colors">
                or write note manually
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveSOAP} className="flex flex-col h-full gap-4">
              {/* SOAP Fields in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-4 flex-1 min-h-[200px]">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjective</label>
                  <p className="text-[10px] text-slate-400 mb-1">Patient's chief complaint and symptoms</p>
                  <textarea value={subjective} onChange={e => setSubjective(e.target.value)} placeholder="Patient reports..." className="w-full flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none bg-slate-50/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objective</label>
                  <p className="text-[10px] text-slate-400 mb-1">Clinical examination findings</p>
                  <textarea value={objective} onChange={e => setObjective(e.target.value)} placeholder="Clinical exam reveals..." className="w-full flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none bg-slate-50/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment</label>
                  <p className="text-[10px] text-slate-400 mb-1">Your clinical diagnosis</p>
                  <textarea value={assessment} onChange={e => setAssessment(e.target.value)} placeholder="Diagnosis..." className="w-full flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none bg-slate-50/50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</label>
                  <p className="text-[10px] text-slate-400 mb-1">Treatment plan and follow-up</p>
                  <textarea value={plan} onChange={e => setPlan(e.target.value)} placeholder="Treatment plan..." className="w-full flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none bg-slate-50/50" />
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">This note will be digitally signed and added to the patient's permanent record.</p>
                <button type="submit" className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm">
                  Sign & Save Note
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>

      {/* Post-Save PDF Prompt Modal */}
      <AnimatePresence>
        {showPDFPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">SOAP Note Signed!</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    The clinical note has been securely saved to the patient's record.
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                <button
                  disabled={pdfStatus !== 'idle'}
                  onClick={async () => {
                    setPdfStatus('loading');
                    const groupedVisits = new Map<string, { notes: any[], procedures: any[] }>();
                    const dateStr = new Date().toISOString().split('T')[0];
                    groupedVisits.set(dateStr, { notes: [], procedures: [] });
                    
                    if (justSignedNoteData) {
                      groupedVisits.get(dateStr)!.notes.push({ ...justSignedNoteData, id: 'temp-print-id' });
                    }

                    const patientConds = toothConditions.filter(c => 
                      c.patientId === selectedPatient.id && 
                      c.status !== 'existing' &&
                      (activeVisitAppointmentId ? c.appointmentId === activeVisitAppointmentId : c.date === dateStr)
                    );
                    patientConds.forEach(cond => {
                      groupedVisits.get(dateStr)!.procedures.push(cond);
                    });
                    
                    await generateClinicalRecord(selectedPatient, clinic, groupedVisits, providers, dateStr, currentUser);
                    setPdfStatus('success');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
                >
                  {pdfStatus === 'loading' ? (
                    'Generating...'
                  ) : pdfStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      PDF Generated
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      Download PDF Record
                    </>
                  )}
                </button>
                {clinic?.whatsappConfig?.enabled && (
                  <button
                    disabled={whatsappStatus !== 'idle'}
                    onClick={async () => {
                      if (!selectedPatient) return;
                      setWhatsappStatus('loading');
                      const dateStr = new Date().toISOString().split('T')[0];
                      const groupedVisits = new Map<string, { notes: any[], procedures: any[] }>();
                      groupedVisits.set(dateStr, { notes: [], procedures: [] });
                      
                      if (justSignedNoteData) {
                        groupedVisits.get(dateStr)!.notes.push({ ...justSignedNoteData, id: 'temp-print-id' });
                      }
  
                      const patientConds = toothConditions.filter(c => 
                        c.patientId === selectedPatient.id && 
                        c.status !== 'existing' &&
                        (activeVisitAppointmentId ? c.appointmentId === activeVisitAppointmentId : c.date === dateStr)
                      );
                      patientConds.forEach(cond => {
                        groupedVisits.get(dateStr)!.procedures.push(cond);
                      });
                      
                      const base64Data = await generateClinicalRecord(selectedPatient, clinic, groupedVisits, providers, dateStr, currentUser, true);
                      
                      if (base64Data && clinic.whatsappConfig) {
                        let msg = clinic.whatsappConfig.clinicalRecordTemplate || 'Hello *{PatientName}*, attached is your clinical record from your recent visit to {ClinicName}.';
                        msg = msg.replace('{PatientName}', selectedPatient.firstName);
                        msg = msg.replace('{ClinicName}', clinic.name);
                        msg = msg.replace('{Date}', dateStr);
                        msg = msg.replace('{Time}', '');
                        
                        const phone = formatPhoneForWhatsApp(selectedPatient.phone, clinic.countryCode || '1');
                        const success = await sendWhatsAppDocument(
                          clinic.whatsappConfig.instanceId,
                          clinic.whatsappConfig.token,
                          phone,
                          `${selectedPatient.lastName}_${selectedPatient.firstName}_ClinicalRecord.pdf`,
                          base64Data,
                          msg
                        );
  
                        if (success) {
                          setWhatsappStatus('success');
                        } else {
                          setWhatsappStatus('idle');
                        }
                      } else {
                         setWhatsappStatus('idle');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
                  >
                    {whatsappStatus === 'loading' ? (
                      'Sending...'
                    ) : whatsappStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        Message Sent
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Send via WhatsApp
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowPDFPrompt(false)}
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-600 font-bold text-sm transition"
                >
                  {pdfStatus === 'success' || whatsappStatus === 'success' ? 'Done' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
