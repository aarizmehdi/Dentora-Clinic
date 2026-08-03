import React, { useState, useEffect } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { Clock, Stethoscope, FileText, Activity, Edit2, Trash2, Download, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateClinicalRecord } from '../../lib/pdfGenerator';
import { InvoiceGeneratorModal } from '../billing/InvoiceGeneratorModal';

export const VisitHistoryView: React.FC = () => {
  const { 
    selectedPatient, 
    toothConditions, 
    soapNotes, 
    providers, 
    clinic,
    invoices,
    saveInvoice,
    pendingInvoiceDate,
    setPendingInvoiceDate,

    updateSOAPNote,
    deleteSOAPNote,
    currentUser
  } = useDentora();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ s: '', o: '', a: '', p: '' });
  const [isGeneratingInvoiceForDate, setIsGeneratingInvoiceForDate] = useState<string | null>(null);

  useEffect(() => {
    if (pendingInvoiceDate) {
      setIsGeneratingInvoiceForDate(pendingInvoiceDate);
      setPendingInvoiceDate(null);
    }
  }, [pendingInvoiceDate, setPendingInvoiceDate]);

  if (!selectedPatient) return null;

  // Get notes and conditions for this patient
  const patientNotes = soapNotes.filter(n => n.patientId === selectedPatient.id);
  const patientConditions = toothConditions.filter(c => c.patientId === selectedPatient.id);

  // Group by visit (appointmentId or fallback to date)
  const groupedVisits = new Map<string, { date: string, appointmentId?: string, notes: any[], procedures: any[] }>();

  patientNotes.forEach(note => {
    const key = note.appointmentId ? `apt_${note.appointmentId}` : `date_${note.date}`;
    if (!groupedVisits.has(key)) {
      groupedVisits.set(key, { date: note.date, appointmentId: note.appointmentId, notes: [], procedures: [] });
    }
    groupedVisits.get(key)!.notes.push(note);
  });

  patientConditions.forEach(cond => {
    // Only completed conditions (not planned) should ideally be in history, but for MVP we show all that have dates.
    const key = cond.appointmentId ? `apt_${cond.appointmentId}` : `date_${cond.date}`;
    if (!groupedVisits.has(key)) {
      groupedVisits.set(key, { date: cond.date, appointmentId: cond.appointmentId, notes: [], procedures: [] });
    }
    groupedVisits.get(key)!.procedures.push(cond);
  });

  // Sort visits descending by date
  const sortedVisitKeys = Array.from(groupedVisits.keys()).sort((a, b) => {
    return new Date(groupedVisits.get(b)!.date).getTime() - new Date(groupedVisits.get(a)!.date).getTime();
  });

  const getProviderName = (id: string) => {
    return providers.find(p => p.id === id)?.name || 'Unknown Provider';
  };

  if (sortedVisitKeys.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-bold text-slate-600">No Visit History</p>
        <p className="text-xs">No clinical notes or procedures have been recorded for this patient yet.</p>
      </div>
    );
  }

  const startEdit = (note: any) => {
    setEditingNoteId(note.id);
    setEditForm({
      s: note.subjective || '',
      o: note.objective || '',
      a: note.assessment || '',
      p: note.plan || ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingNoteId) return;
    updateSOAPNote(editingNoteId, {
      subjective: editForm.s,
      objective: editForm.o,
      assessment: editForm.a,
      plan: editForm.p
    });
    setEditingNoteId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this clinical note?')) {
      deleteSOAPNote(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-black text-slate-900">Patient Visit History</h2>
        </div>
      </div>
      
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-8">
        {sortedVisitKeys.map((visitKey, index) => {
          const visit = groupedVisits.get(visitKey)!;
          // Use provider from first note or procedure
          const providerId = visit.notes[0]?.providerId || visit.procedures[0]?.providerId;
          const providerName = providerId ? getProviderName(providerId) : 'Dental Provider';

          const visitInvoice = invoices.find(inv => 
            inv.patientId === selectedPatient.id && 
            (visit.appointmentId ? inv.appointmentId === visit.appointmentId : inv.date === visit.date)
          );

          return (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={visitKey} 
              className="relative pl-6"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-teal-500 ring-4 ring-white shadow-sm" />
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Visit Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{new Date(visit.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {providerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button 
                      onClick={() => generateClinicalRecord(selectedPatient, clinic, groupedVisits, providers, visitKey, currentUser)}
                      className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 transition rounded-lg flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                      title="Download PDF for this visit"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Immutable Record
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-5">
                  {/* Procedures Section */}
                  {visit.procedures.filter(p => p.status !== 'existing').length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        Clinical Procedures & Findings
                      </h4>
                      <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                        {visit.procedures.filter(p => p.status !== 'existing').map((proc, i) => (
                          <div key={i} className="p-3 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900">{proc.description}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono bg-white px-1.5 py-0.5 border rounded text-[10px] text-slate-600 font-semibold">
                                  Tooth #{proc.toothNumber}
                                </span>
                                {proc.surfaces && proc.surfaces.length > 0 && (
                                  <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-semibold">
                                    Surfaces: {proc.surfaces.join('')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {proc.cdtCode && (
                              <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded-md border">
                                {proc.cdtCode}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SOAP Notes Section */}
                  {visit.notes.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        Signed Progress Notes (SOAP)
                      </h4>
                      <div className="space-y-3">
                        {visit.notes.map((note) => (
                          <div key={note.id} className="bg-amber-50/30 rounded-xl border border-amber-100/50 p-4 space-y-3 text-xs relative group transition-all">
                            
                            {editingNoteId === note.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="font-bold text-slate-700 block mb-1">Subjective</label>
                                  <textarea className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" rows={2} value={editForm.s} onChange={e => setEditForm({...editForm, s: e.target.value})} />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 block mb-1">Objective</label>
                                  <textarea className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" rows={2} value={editForm.o} onChange={e => setEditForm({...editForm, o: e.target.value})} />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 block mb-1">Assessment</label>
                                  <textarea className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" rows={2} value={editForm.a} onChange={e => setEditForm({...editForm, a: e.target.value})} />
                                </div>
                                <div>
                                  <label className="font-bold text-slate-700 block mb-1">Plan</label>
                                  <textarea className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" rows={2} value={editForm.p} onChange={e => setEditForm({...editForm, p: e.target.value})} />
                                </div>
                                <div className="flex gap-2 justify-end pt-2 border-t border-amber-100/50">
                                  <button onClick={() => setEditingNoteId(null)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition">Cancel</button>
                                  <button onClick={handleSaveEdit} className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-500 shadow-sm transition">Save Changes</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                  <button onClick={() => startEdit(note)} className="text-slate-400 hover:text-teal-600 bg-white shadow-sm p-1.5 rounded-md border border-slate-200 transition" title="Edit Note">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDelete(note.id)} className="text-slate-400 hover:text-rose-600 bg-white shadow-sm p-1.5 rounded-md border border-slate-200 transition" title="Delete Note">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {note.subjective && (
                                  <div>
                                    <span className="font-bold text-slate-800 block">S - Subjective:</span>
                                    <p className="text-slate-600 mt-0.5 leading-relaxed">{note.subjective}</p>
                                  </div>
                                )}
                                {note.objective && (
                                  <div>
                                    <span className="font-bold text-slate-800 block">O - Objective:</span>
                                    <p className="text-slate-600 mt-0.5 leading-relaxed">{note.objective}</p>
                                  </div>
                                )}
                                {note.assessment && (
                                  <div>
                                    <span className="font-bold text-slate-800 block">A - Assessment:</span>
                                    <p className="text-slate-600 mt-0.5 leading-relaxed">{note.assessment}</p>
                                  </div>
                                )}
                                {note.plan && (
                                  <div>
                                    <span className="font-bold text-slate-800 block">P - Plan:</span>
                                    <p className="text-slate-600 mt-0.5 leading-relaxed">{note.plan}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isGeneratingInvoiceForDate === visitKey && (
                  <InvoiceGeneratorModal
                    patientId={selectedPatient.id}
                    visitDate={visit.date}
                    appointmentId={visit.appointmentId}
                    existingInvoice={visitInvoice}
                    procedures={visit.procedures}
                    onClose={() => setIsGeneratingInvoiceForDate(null)}
                    onFinalize={(invoice) => {
                      saveInvoice(invoice);
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
