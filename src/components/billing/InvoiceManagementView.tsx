import React, { useState } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { CreditCard, Search, FileDown, CheckCircle2, DollarSign, Printer, Clock, MessageSquare } from 'lucide-react';
import { generateInvoicePDF } from '../../lib/pdfGenerator';
import { sendWhatsAppDocument, formatPhoneForWhatsApp } from '../../lib/ultramsg';
import { printPDFBase64 } from '../../lib/printUtils';
import { motion } from 'framer-motion';

export const InvoiceManagementView: React.FC = () => {
  const { invoices, patients, clinic, saveInvoice, selectPatient, setActiveTab, currencySymbol } = useDentora();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | '1_month' | '3_months' | '6_months' | '1_year'>('all');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'whatsapp' | 'print' | 'download' | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const patient = patients.find(p => p.id === inv.patientId);
    const searchString = `${inv.invoiceNumber} ${patient?.firstName} ${patient?.lastName}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    const invDate = new Date(inv.date);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - invDate.getFullYear()) * 12 + (today.getMonth() - invDate.getMonth());
    
    if (dateFilter === '1_month') {
      matchesDate = monthsDiff <= 1;
    } else if (dateFilter === '3_months') {
      matchesDate = monthsDiff <= 3;
    } else if (dateFilter === '6_months') {
      matchesDate = monthsDiff <= 6;
    } else if (dateFilter === '1_year') {
      matchesDate = monthsDiff <= 12;
    }
    
    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleMarkPaid = (inv: typeof invoices[0]) => {
    saveInvoice({ ...inv, status: 'paid' });
  };

  const handleDownload = (inv: typeof invoices[0]) => {
    const patient = patients.find(p => p.id === inv.patientId);
    if (patient) {
      generateInvoicePDF(inv, patient, clinic);
    }
  };

  const handlePrint = async (inv: typeof invoices[0]) => {
    const patient = patients.find(p => p.id === inv.patientId);
    if (!patient || !clinic) return;
    setActiveActionId(inv.id);
    setActionType('print');
    const base64Data = await generateInvoicePDF(inv, patient, clinic, true);
    if (base64Data) {
      printPDFBase64(base64Data);
      if (inv.deliveryStatus !== 'sent') {
        saveInvoice({ ...inv, deliveryStatus: 'printed' });
      }
    }
    setActiveActionId(null);
    setActionType(null);
  };

  const handleSendWhatsApp = async (inv: typeof invoices[0]) => {
    const patient = patients.find(p => p.id === inv.patientId);
    if (!patient || !clinic?.whatsappConfig?.enabled) return;

    setActiveActionId(inv.id);
    setActionType('whatsapp');
    try {
      const base64Data = await generateInvoicePDF(inv, patient, clinic, true);
      if (base64Data) {
        let msg = clinic.whatsappConfig.invoiceTemplate || 'Hello *{PatientName}*, attached is your invoice for your visit to {ClinicName}.';
        msg = msg.replace('{PatientName}', patient.firstName);
        msg = msg.replace('{ClinicName}', clinic.name);
        msg = msg.replace('{Date}', inv.date);
        
        // Use global formatter
        const phone = formatPhoneForWhatsApp(patient.phone, clinic.countryCode || '1');
        
        const success = await sendWhatsAppDocument(
          clinic.whatsappConfig.instanceId,
          clinic.whatsappConfig.token,
          phone,
          `Invoice_${patient.lastName}_INV-${inv.id.substring(0, 8)}.pdf`,
          base64Data,
          msg
        );

        if (success) {
          saveInvoice({ ...inv, deliveryStatus: 'sent' });
        }
      }
    } catch (error) {
      console.error(error);
    }
    setActiveActionId(null);
    setActionType(null);
  };

  const todayString = new Date().toISOString().split('T')[0];
  
  // Calculate actionable metrics
  const filteredCollections = filteredInvoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const filteredCount = filteredInvoices.length;

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6">
      {/* Actionable Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300 flex flex-col justify-center cursor-default group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Total Collections</p>
            <DollarSign className="w-5 h-5 text-emerald-500 opacity-80" />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{currencySymbol}{filteredCollections.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300 flex flex-col justify-center cursor-default group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Total Invoices Generated</p>
            <FileDown className="w-5 h-5 text-slate-500 opacity-80" />
          </div>
          <div>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{filteredCount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters & List */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden print:border-none print:shadow-none">
        
        <div className="hidden print:block p-6 border-b border-slate-200 mb-4">
          <h1 className="text-2xl font-black text-slate-900">Billing Statement</h1>
          <p className="text-sm font-medium text-slate-500">{clinic?.name} • Printed on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice # or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 focus:outline-none bg-white min-w-[140px]"
            >
              <option value="all">All Time</option>
              <option value="1_month">Last 1 Month</option>
              <option value="3_months">Last 3 Months</option>
              <option value="6_months">Last 6 Months</option>
              <option value="1_year">Last 1 Year</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Statement
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider print:hidden">Delivery</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const patient = patients.find(p => p.id === inv.patientId);
                return (
                  <motion.tr 
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{inv.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          if (patient) {
                            selectPatient(patient.id);
                            setActiveTab('patients');
                          }
                        }}
                        className="text-sm font-semibold text-teal-600 hover:underline"
                      >
                        {patient?.firstName} {patient?.lastName}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-900">
                        {currencySymbol}{inv.grandTotal.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      {inv.deliveryStatus === 'sent' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Sent
                        </span>
                      ) : inv.deliveryStatus === 'printed' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          <Printer className="w-3 h-3" /> Printed
                        </span>
                      ) : (
                        <span className="inline-flex text-[10px] font-bold uppercase text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePrint(inv)}
                          disabled={activeActionId === inv.id}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                          title="Print Invoice"
                        >
                          <Printer className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={activeActionId === inv.id}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition disabled:opacity-50"
                          title="Download PDF"
                        >
                          <FileDown className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
