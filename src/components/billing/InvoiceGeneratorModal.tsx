import React, { useState, useEffect } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { Invoice, InvoiceItem, ToothCondition } from '../../types/dental';
import { X, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoicePDF } from '../../lib/pdfGenerator';
import { sendWhatsAppDocument, formatPhoneForWhatsApp } from '../../lib/ultramsg';
import { printPDFBase64 } from '../../lib/printUtils';
import { Printer, FileDown, MessageSquare } from 'lucide-react';

interface InvoiceGeneratorModalProps {
  patientId: string;
  visitDate: string;
  onClose: () => void;
  onFinalize: (invoice: Invoice) => void;
  existingInvoice?: Invoice;
  procedures: ToothCondition[];
  appointmentId?: string;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  patientId,
  visitDate,
  onClose,
  onFinalize,
  existingInvoice,
  procedures,
  appointmentId
}) => {
  const { clinicServices, addClinicService, patients, clinic, invoices, currencySymbol, showToast } = useDentora();
  const patient = patients.find(p => p.id === patientId);
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'fixed' | 'percentage'>(existingInvoice?.discountType || 'none');
  const [discountValue, setDiscountValue] = useState<number>(existingInvoice?.discountValue || 0);
  
  // Combine status and payment method into a single unified state for the UI
  const initialPayment = existingInvoice?.status === 'unpaid' ? 'Unpaid' : (existingInvoice?.paymentMethod || 'Cash');
  const [paymentSelection, setPaymentSelection] = useState<string>(initialPayment);

  const [finalizeStatus, setFinalizeStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [whatsappStatus, setWhatsappStatus] = useState<'idle'|'loading'|'success'>('idle');
  const [printStatus, setPrintStatus] = useState<'idle'|'loading'|'success'>('idle');
  
  // Track if this instance has finalized an invoice
  const [isLocallyFinalized, setIsLocallyFinalized] = useState(existingInvoice?.isFinalized || false);
  const [localInvoice, setLocalInvoice] = useState<Invoice | undefined>(existingInvoice);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Initialize items
  useEffect(() => {
    if (existingInvoice) {
      setItems(existingInvoice.items);
    } else {
      // Auto-load from procedures if possible, matching by name loosely or just creating custom items
      const initialItems: InvoiceItem[] = procedures.map(proc => {
        // Try to find a matching service in catalog
        const match = clinicServices.find(s => 
          s.name.toLowerCase().includes(proc.conditionType.toLowerCase()) || 
          proc.description.toLowerCase().includes(s.name.toLowerCase())
        );
        
        return {
          id: crypto.randomUUID(),
          serviceId: match?.id,
          name: proc.description,
          quantity: 1,
          unitPrice: match?.defaultPrice || 0,
          total: match?.defaultPrice || 0
        };
      });
      setItems(initialItems.length > 0 ? initialItems : [{ id: crypto.randomUUID(), name: '', quantity: 1, unitPrice: 0, total: 0 }]);
    }
  }, [existingInvoice, procedures, clinicServices]);

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleServiceSelect = (itemId: string, serviceId: string) => {
    const service = clinicServices.find(s => s.id === serviceId);
    if (service) {
      setItems(items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            serviceId: service.id,
            name: service.name,
            unitPrice: service.defaultPrice,
            total: item.quantity * service.defaultPrice
          };
        }
        return item;
      }));
    }
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'fixed' ? discountValue : discountType === 'percentage' ? (subtotal * discountValue) / 100 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleFinalize = async () => {
    
    // Validate
    if (items.some(i => !i.name.trim())) {
      alert('All items must have a description.');
      return;
    }

    setFinalizeStatus('loading');

    const generatedId = localInvoice?.id || crypto.randomUUID();
    const newInvoice: Invoice = {
      id: generatedId,
      invoiceNumber: localInvoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${generatedId.substring(0, 6).toUpperCase()}`,
      clinicId: clinic?.id || '',
      patientId,
      appointmentId,
      date: visitDate,
      items,
      discountType,
      discountValue,
      subtotal,
      grandTotal,
      status: paymentSelection === 'Unpaid' ? 'unpaid' : 'paid',
      isFinalized: true
    };
    
    // Firestore does not accept undefined
    if (paymentSelection !== 'Unpaid') {
      newInvoice.paymentMethod = paymentSelection as any;
    }

    setLocalInvoice(newInvoice);
    setIsLocallyFinalized(true);
    setFinalizeStatus('success');

    const shouldAutoSend = Boolean(patient && patient.phone);

    if (shouldAutoSend && patient) {
      setWhatsappStatus('loading');
      setShowSuccessOverlay(true);
      try {
        const base64Data = await generateInvoicePDF(newInvoice, patient, clinic, true);
        if (base64Data) {
          let msg = clinic?.whatsappConfig?.invoiceTemplate || 'Hello *{PatientName}*, attached is your invoice for your visit to {ClinicName}.';
          msg = msg.replace('{PatientName}', patient.firstName);
          msg = msg.replace('{ClinicName}', clinic?.name || 'our practice');
          msg = msg.replace('{Date}', new Date(newInvoice.date).toLocaleDateString());
          
          const phone = formatPhoneForWhatsApp(patient.phone, clinic?.countryCode || '92');
          const success = await sendWhatsAppDocument(
            clinic?.whatsappConfig?.instanceId,
            clinic?.whatsappConfig?.token,
            phone,
            `Invoice_${patient.lastName}_INV-${newInvoice.id.substring(0, 8)}.pdf`,
            base64Data,
            msg
          );
          if (success) {
            setWhatsappStatus('success');
            showToast('Invoice Sent', `Invoice sent to ${patient.firstName} automatically via WhatsApp.`, 'success');
            const updatedInvoice = { ...newInvoice, deliveryStatus: 'sent' as const };
            setLocalInvoice(updatedInvoice);
            setTimeout(() => {
              setWhatsappStatus('idle');
              onFinalize(updatedInvoice);
            }, 1500);
          } else {
            setWhatsappStatus('idle');
            showToast('WhatsApp Error', 'Failed to send invoice automatically. Check UltraMsg config.', 'warning');
            setTimeout(() => onFinalize(newInvoice), 1000);
          }
        } else {
          setWhatsappStatus('idle');
          showToast('PDF Error', 'Failed to generate PDF for WhatsApp.', 'danger');
          setTimeout(() => onFinalize(newInvoice), 1000);
        }
      } catch (e) {
        console.error('Auto WhatsApp send failed:', e);
        setWhatsappStatus('idle');
        showToast('System Error', 'An error occurred while sending WhatsApp message.', 'danger');
        setTimeout(() => onFinalize(newInvoice), 1000);
      }
    } else {
      setShowSuccessOverlay(true);
      setTimeout(() => onFinalize(newInvoice), 1000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!localInvoice || !patient) return;
    setDownloadStatus('loading');
    try {
      await generateInvoicePDF(localInvoice, patient, clinic);
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (e) {
      console.error('PDF download failed:', e);
      setDownloadStatus('idle');
    }
  };

  const handlePrintPDF = async () => {
    if (!localInvoice || !patient) return;
    setPrintStatus('loading');
    try {
      const base64Data = await generateInvoicePDF(localInvoice, patient, clinic, true);
      if (base64Data) {
        printPDFBase64(base64Data);
        setPrintStatus('success');
        if (localInvoice.deliveryStatus !== 'sent') {
          const updatedInvoice = { ...localInvoice, deliveryStatus: 'printed' as const };
          setLocalInvoice(updatedInvoice);
          onFinalize(updatedInvoice);
        }
        setTimeout(() => setPrintStatus('idle'), 3000);
      } else {
        setPrintStatus('idle');
      }
    } catch (e) {
      console.error('Print failed:', e);
      setPrintStatus('idle');
    }
  };

  const handleSendWhatsApp = async () => {
    if (!localInvoice || !patient) return;
    setWhatsappStatus('loading');
    try {
      const base64Data = await generateInvoicePDF(localInvoice, patient, clinic, true);
      if (base64Data) {
        let msg = clinic?.whatsappConfig?.invoiceTemplate || 'Hello *{PatientName}*, attached is your invoice for your visit to {ClinicName}.';
        msg = msg.replace('{PatientName}', patient.firstName);
        msg = msg.replace('{ClinicName}', clinic?.name || 'our practice');
        msg = msg.replace('{Date}', new Date(localInvoice.date).toLocaleDateString());
        
        const phone = formatPhoneForWhatsApp(patient.phone, clinic?.countryCode || '92');
        const success = await sendWhatsAppDocument(
          clinic?.whatsappConfig?.instanceId,
          clinic?.whatsappConfig?.token,
          phone,
          `Invoice_${patient.lastName}_INV-${localInvoice.id.substring(0, 8)}.pdf`,
          base64Data,
          msg
        );
        if (success) {
          setWhatsappStatus('success');
          showToast('Invoice Sent', `Invoice sent to ${patient.firstName} via WhatsApp.`, 'success');
          const updatedInvoice = { ...localInvoice, deliveryStatus: 'sent' as const };
          setLocalInvoice(updatedInvoice);
          onFinalize(updatedInvoice);
          setTimeout(() => setWhatsappStatus('idle'), 3000);
        } else {
          setWhatsappStatus('idle');
          showToast('WhatsApp Error', 'Failed to send invoice. Check UltraMsg config.', 'danger');
        }
      } else {
        setWhatsappStatus('idle');
        showToast('PDF Error', 'Failed to generate PDF for WhatsApp.', 'danger');
      }
    } catch (e) {
      console.error('WhatsApp send failed:', e);
      setWhatsappStatus('idle');
      showToast('System Error', 'An error occurred while sending WhatsApp message.', 'danger');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isLocallyFinalized ? 'View Invoice' : 'Generate Invoice'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Date of Service: {new Date(visitDate).toLocaleDateString()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSuccessOverlay ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Invoice Generated!</h2>
             <p className="text-slate-500 text-sm mb-8 text-center">The invoice has been saved to the patient's record.</p>
             
             <div className="w-full max-w-sm flex flex-col gap-3">
               <button 
                  onClick={handleDownloadPDF}
                  disabled={downloadStatus !== 'idle'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
                >
                  {downloadStatus === 'loading' ? 'Generating...' : downloadStatus === 'success' ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> PDF Downloaded</> : <><FileDown className="w-4 h-4" /> Download PDF</>}
                </button>

                <button 
                  onClick={handlePrintPDF}
                  disabled={printStatus !== 'idle'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-sm transition shadow-sm"
                >
                  {printStatus === 'loading' ? 'Printing...' : printStatus === 'success' ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Printed</> : <><Printer className="w-4 h-4" /> Print Receipt</>}
                </button>
                
                {clinic?.whatsappConfig?.enabled && clinic?.whatsappConfig?.invoiceDeliveryMode !== 'auto' && (
                  <button 
                    onClick={handleSendWhatsApp}
                    disabled={whatsappStatus !== 'idle'}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white font-bold text-sm transition shadow-sm"
                  >
                    {whatsappStatus === 'loading' ? 'Sending...' : whatsappStatus === 'success' ? <><CheckCircle2 className="w-4 h-4 text-white" /> Message Sent</> : <><MessageSquare className="w-4 h-4" /> Send via WhatsApp</>}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition mt-2"
                >
                  Done
                </button>
             </div>
          </div>
        ) : (
          <>
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50 p-6 space-y-6">
          {/* Items Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/50 border-b border-slate-100 text-xs font-black text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Service / Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1 text-center"></div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-start hover:bg-slate-50/30 transition-colors">
                  <div className="col-span-5 space-y-2">
                    {!isLocallyFinalized && (
                      <select 
                        className="w-full p-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                        value={item.serviceId || ''}
                        onChange={(e) => handleServiceSelect(item.id, e.target.value)}
                      >
                        <option value="">-- Custom Item --</option>
                        {clinicServices.map(cs => (
                          <option key={cs.id} value={cs.id}>{cs.name}</option>
                        ))}
                      </select>
                    )}
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      disabled={isLocallyFinalized}
                      placeholder="Procedure description..."
                      className="w-full p-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-shadow disabled:bg-transparent disabled:border-transparent disabled:p-0 disabled:font-bold disabled:text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      disabled={isLocallyFinalized}
                      className="w-full p-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-shadow disabled:bg-transparent disabled:border-transparent disabled:p-0 disabled:text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-teal-500 transition-shadow overflow-hidden">
                      <span className="pl-3 pr-2 text-slate-400 text-sm font-bold bg-slate-50 border-r border-slate-100 py-2.5">{currencySymbol}</span>
                      <input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        disabled={isLocallyFinalized}
                        className="w-full p-2.5 text-sm font-bold outline-none disabled:bg-transparent disabled:text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 py-2.5">
                    <span className="text-sm font-black text-slate-800">
                      {currencySymbol}{item.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1 py-2 text-center">
                    {!isLocallyFinalized && items.length > 1 && (
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {!isLocallyFinalized && (
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <button 
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Line
                </button>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Payment & Status */}
            <div className="flex-1 space-y-4">
              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Payment Method</label>
                    <select 
                      value={paymentSelection}
                      onChange={(e) => setPaymentSelection(e.target.value)}
                      disabled={isLocallyFinalized}
                      className="w-full p-3.5 text-sm font-bold rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-shadow disabled:opacity-75 disabled:bg-slate-100"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="w-full md:w-80 bg-slate-900 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm font-medium text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>Discount</span>
                    {!isLocallyFinalized && (
                      <select 
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="bg-slate-800 text-xs rounded border border-slate-700 text-slate-300 px-1 py-0.5 outline-none"
                      >
                        <option value="none">None</option>
                        <option value="fixed">Fixed ({currencySymbol})</option>
                        <option value="percentage">%</option>
                      </select>
                    )}
                  </div>
                  {discountType !== 'none' && !isLocallyFinalized ? (
                    <input 
                      type="number"
                      min="0"
                      value={discountValue === 0 ? '' : discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-16 bg-slate-800 text-right text-xs rounded border border-slate-700 text-white px-2 py-1 outline-none"
                    />
                  ) : (
                    <span>{discountAmount > 0 ? `-${currencySymbol}${discountAmount.toFixed(2)}` : `${currencySymbol}0.00`}</span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700/50 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-white">{currencySymbol}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <div>
             {isLocallyFinalized && (
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={downloadStatus !== 'idle'}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                  >
                    {downloadStatus === 'loading' ? 'Generating...' : downloadStatus === 'success' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Downloaded</> : <><FileDown className="w-3.5 h-3.5" /> Download PDF</>}
                  </button>
                  <button 
                    onClick={handlePrintPDF}
                    disabled={printStatus !== 'idle'}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                  >
                    {printStatus === 'loading' ? 'Printing...' : printStatus === 'success' ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Printed</> : <><Printer className="w-3.5 h-3.5" /> Print</>}
                  </button>
               </div>
             )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
            >
              {isLocallyFinalized ? 'Done' : 'Cancel'}
            </button>
            
            {!isLocallyFinalized && (
              <button 
                onClick={handleFinalize}
                disabled={finalizeStatus !== 'idle'}
                className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl transition shadow-sm flex items-center gap-2"
              >
                {finalizeStatus === 'loading' ? 'Generating...' : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finalize & Generate PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
