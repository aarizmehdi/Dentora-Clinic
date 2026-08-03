import React from 'react';
import { useDentora } from '../../context/DentoraContext';
import { DollarSign, FileDown, MessageSquare, Printer, CheckCircle2 } from 'lucide-react';
import { generateInvoicePDF } from '../../lib/pdfGenerator';
import { sendWhatsAppDocument, formatPhoneForWhatsApp } from '../../lib/ultramsg';
import { printPDFBase64 } from '../../lib/printUtils';
import { useState } from 'react';

export const PatientBillingView: React.FC = () => {
  const { invoices, selectedPatient, clinic, currencySymbol, saveInvoice } = useDentora();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'whatsapp' | 'print' | 'download' | null>(null);

  if (!selectedPatient) return null;

  const patientInvoices = invoices
    .filter(inv => inv.patientId === selectedPatient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (patientInvoices.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
        <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-bold text-slate-600">No Billing History</p>
        <p className="text-xs">There are no invoices for this patient.</p>
      </div>
    );
  }

  const handleDownload = (inv: any) => {
    generateInvoicePDF(inv, selectedPatient, clinic);
  };

  const handlePrint = async (inv: any) => {
    if (!clinic || !selectedPatient) return;
    setActiveActionId(inv.id);
    setActionType('print');
    const base64Data = await generateInvoicePDF(inv, selectedPatient, clinic, true);
    if (base64Data) {
      printPDFBase64(base64Data);
      if (inv.deliveryStatus !== 'sent') {
        saveInvoice({ ...inv, deliveryStatus: 'printed' });
      }
    }
    setActiveActionId(null);
    setActionType(null);
  };

  const handleSendWhatsApp = async (inv: any) => {
    if (!clinic?.whatsappConfig?.enabled) return;
    setActiveActionId(inv.id);
    setActionType('whatsapp');
    try {
      const base64Data = await generateInvoicePDF(inv, selectedPatient, clinic, true);
      if (base64Data) {
        let msg = clinic.whatsappConfig.invoiceTemplate || 'Hello *{PatientName}*, attached is your invoice for your visit to {ClinicName}.';
        msg = msg.replace('{PatientName}', selectedPatient.firstName);
        msg = msg.replace('{ClinicName}', clinic.name);
        msg = msg.replace('{Date}', new Date(inv.date).toLocaleDateString());
        
        const phone = formatPhoneForWhatsApp(selectedPatient.phone, clinic.countryCode || '1');
        const success = await sendWhatsAppDocument(
          clinic.whatsappConfig.instanceId,
          clinic.whatsappConfig.token,
          phone,
          `Invoice_${selectedPatient.lastName}_INV-${inv.id.substring(0, 8)}.pdf`,
          base64Data,
          msg
        );
        if (success) {
          saveInvoice({ ...inv, deliveryStatus: 'sent' });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setActiveActionId(null);
    setActionType(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-4 overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-3">Invoice / Date</div>
        <div className="col-span-2">Amount</div>
        <div className="col-span-2">Payment</div>
        <div className="col-span-2">Delivery</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>
      <div className="divide-y divide-slate-100">
        {patientInvoices.map(inv => (
          <div key={inv.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition">
            <div className="col-span-3">
              <p className="text-sm font-bold text-slate-900">INV-{inv.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{new Date(inv.date).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-black text-slate-900">{currencySymbol}{inv.grandTotal.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shadow-sm ${
                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {inv.status}
              </span>
            </div>
            <div className="col-span-2">
              {inv.deliveryStatus === 'sent' ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3 h-3" /> Sent
                </span>
              ) : inv.deliveryStatus === 'printed' ? (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Printer className="w-3 h-3" /> Printed
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                  Pending
                </span>
              )}
            </div>
            <div className="col-span-3 flex items-center justify-end gap-2">
              <button
                onClick={() => handlePrint(inv)}
                disabled={activeActionId === inv.id}
                title="Print"
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(inv)}
                disabled={activeActionId === inv.id}
                title="Download PDF"
                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
