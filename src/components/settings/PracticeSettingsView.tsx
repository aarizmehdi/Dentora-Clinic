import React, { useState, useRef } from 'react';
import { useDentora } from '../../context/DentoraContext';
import { uploadToImgBB } from '../../lib/imgbb';
import { 
  Settings, Shield, MapPin, Users, Building2, Calendar,
  Bell, FileText, Sliders, MonitorSmartphone, Trash2, Plus, X, CreditCard, MessageSquare, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DentoraLogo } from '../common/DentoraLogo';

type SettingsTab = 'clinic' | 'users' | 'billing' | 'whatsapp' | 'system';

export const PracticeSettingsView: React.FC = () => {
  const { 
    clinic, updateClinic, locations, operatories, addOperatory, removeOperatory, providers, currentRole, 
    timeZone, setTimeZone, timeFormat, setTimeFormat, addProvider, addLocation, updateLocation,
    clinicServices, addClinicService, updateClinicService, deleteClinicService, currencySymbol, showToast
  } = useDentora();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic');

  const [clinicName, setClinicName] = useState(clinic?.name || '');
  const [clinicTaxId, setClinicTaxId] = useState(clinic?.taxId || '');
  const [clinicLogoUrl, setClinicLogoUrl] = useState(clinic?.logoUrl || '');
  const [clinicCountry, setClinicCountry] = useState(clinic?.country || 'USA');
  const [isSavingClinic, setIsSavingClinic] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveClinicDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName) return;
    setIsSavingClinic(true);
    
    // Auto-derive country code based on selected country
    let code = '1';
    if (clinicCountry === 'Pakistan') code = '92';
    if (clinicCountry === 'UK') code = '44';
    if (clinicCountry === 'India') code = '91';

    await updateClinic({ 
      name: clinicName, 
      taxId: clinicTaxId, 
      logoUrl: clinicLogoUrl,
      country: clinicCountry,
      countryCode: code
    });
    setIsSavingClinic(false);
  };

  const [waInstanceId, setWaInstanceId] = useState(clinic?.whatsappConfig?.instanceId || '');
  const [waToken, setWaToken] = useState(clinic?.whatsappConfig?.token || '');
  const [waEnabled, setWaEnabled] = useState(clinic?.whatsappConfig?.enabled || false);
  const [waApptBookedTemplate, setWaApptBookedTemplate] = useState(clinic?.whatsappConfig?.appointmentBookedTemplate || 'Hello *{PatientName}*, your appointment is booked for *{Date}* at *{Time}* with {ClinicName}.');
  const [waApptReminderTemplate, setWaApptReminderTemplate] = useState(clinic?.whatsappConfig?.appointmentReminderTemplate || 'Hello *{PatientName}*, this is a friendly reminder for your appointment tomorrow at *{Time}* with {ClinicName}.');
  const [waInvoiceTemplate, setWaInvoiceTemplate] = useState(clinic?.whatsappConfig?.invoiceTemplate || 'Hello *{PatientName}*, attached is your invoice for your visit to {ClinicName}.');
  const [waClinicalTemplate, setWaClinicalTemplate] = useState(clinic?.whatsappConfig?.clinicalRecordTemplate || 'Hello *{PatientName}*, attached is your clinical record from your recent visit to {ClinicName}.');
  const [waInvoiceDeliveryMode, setWaInvoiceDeliveryMode] = useState<'auto'|'ask'|'manual'>(clinic?.whatsappConfig?.invoiceDeliveryMode || 'auto');
  const [isSavingWA, setIsSavingWA] = useState(false);

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWA(true);
    await updateClinic({
      whatsappConfig: {
        instanceId: waInstanceId,
        token: waToken,
        enabled: waEnabled,
        appointmentBookedTemplate: waApptBookedTemplate,
        appointmentReminderTemplate: waApptReminderTemplate,
        invoiceTemplate: waInvoiceTemplate,
        clinicalRecordTemplate: waClinicalTemplate,
        invoiceDeliveryMode: waInvoiceDeliveryMode
      }
    });
    setIsSavingWA(false);
  };

  const [sysTimeFormat, setSysTimeFormat] = useState(timeFormat);
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSystem(true);
    
    // Auto-derive country code
    let code = '1';
    if (clinicCountry === 'Pakistan') code = '92';
    if (clinicCountry === 'UK') code = '44';
    if (clinicCountry === 'India') code = '91';

    setTimeFormat(sysTimeFormat);
    await updateClinic({ 
      country: clinicCountry,
      countryCode: code
    });
    showToast('Preferences Saved', 'System preferences have been updated successfully.', 'success');
    setIsSavingSystem(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingLogo(true);
    try {
      const url = await uploadToImgBB(file);
      setClinicLogoUrl(url);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setIsUploadingLogo(false);
    }
  };


  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');

  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationCode, setNewLocationCode] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');

  const [addingOperatoryToLocation, setAddingOperatoryToLocation] = useState<string | null>(null);
  const [newOpName, setNewOpName] = useState('');
  const [newOpType, setNewOpType] = useState('Standard');
  const [newOpIsHygiene, setNewOpIsHygiene] = useState(false);

  // Billing State
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    addClinicService({
      name: newServiceName,
      defaultPrice: parseFloat(newServicePrice)
    });
    setNewServiceName('');
    setNewServicePrice('');
    setIsAddingService(false);
  };

  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');
  const [editLocCode, setEditLocCode] = useState('');
  const [editLocAddress, setEditLocAddress] = useState('');
  const [editLocPhone, setEditLocPhone] = useState('');
  const [editLocOpen, setEditLocOpen] = useState('08:00');
  const [editLocClose, setEditLocClose] = useState('17:00');

  const openLocationEditor = (loc: any) => {
    setEditLocName(loc.name);
    setEditLocCode(loc.code);
    setEditLocAddress(loc.address);
    setEditLocPhone(loc.phone || '');
    setEditLocOpen(loc.operatingHours?.open || '08:00');
    setEditLocClose(loc.operatingHours?.close || '17:00');
    setEditingLocationId(loc.id);
    setAddingOperatoryToLocation(null);
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocationId || !editLocName) return;
    await updateLocation(editingLocationId, {
      name: editLocName,
      code: editLocCode,
      address: editLocAddress,
      phone: editLocPhone,
      operatingHours: { open: editLocOpen, close: editLocClose }
    });
    setEditingLocationId(null);
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName) return;
    addProvider({
      name: newDoctorName,
      title: 'D.D.S.',
      specialty: newDoctorSpecialty || 'General Dentistry',
      color: '#10B981', // Emerald
      locationIds: [locations[0]?.id || 'loc_1']
    });
    setNewDoctorName('');
    setNewDoctorSpecialty('');
    setShowAddDoctor(false);
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName) return;
    addLocation({
      name: newLocationName,
      code: newLocationCode || newLocationName.substring(0, 3).toUpperCase(),
      address: newLocationAddress || 'Address TBD',
      phone: '(555) 000-0000',
      operatoriesCount: 0
    });
    setNewLocationName('');
    setNewLocationCode('');
    setNewLocationAddress('');
    setShowAddLocation(false);
  };

  const handleAddOperatory = (e: React.FormEvent, locId: string) => {
    e.preventDefault();
    if (!newOpName) return;
    addOperatory({
      name: newOpName,
      locationId: locId,
      equipmentType: newOpType,
      isHygiene: newOpIsHygiene,
    });
    setNewOpName('');
    setNewOpType('Standard');
    setNewOpIsHygiene(false);
    setAddingOperatoryToLocation(null);
  };

  const tabs = [
    { id: 'clinic', label: 'Clinic & Locations', icon: Building2 },
    { id: 'users', label: 'Staff Management', icon: Users },
    { id: 'billing', label: 'Billing & Services', icon: CreditCard },
    { id: 'whatsapp', label: 'WhatsApp Integrations', icon: MessageSquare },
    { id: 'system', label: 'System Preferences', icon: Sliders },
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col sm:flex-row gap-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Settings Navigation Sidebar */}
      <div className="w-full sm:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-5 border-b border-slate-200">
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage your practice environment.</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-100' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <AnimatePresence mode="wait">
          
          {/* CLINIC & LOCATIONS */}
          {activeTab === 'clinic' && (
            <motion.div key="clinic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl space-y-8">
              
              {/* Global Practice Details */}
              <div className="relative bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-teal-900/5 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
                <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  Global Practice Details
                </h3>
                <form onSubmit={handleSaveClinicDetails} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Practice Name</label>
                      <input 
                        type="text" 
                        value={clinicName} 
                        onChange={(e) => setClinicName(e.target.value)} 
                        className="w-full p-3 text-sm font-semibold rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 transition-all placeholder:font-normal" 
                        placeholder="e.g. Dentora Premier Care"
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tax / Registration ID</label>
                      <input 
                        type="text" 
                        value={clinicTaxId} 
                        onChange={(e) => setClinicTaxId(e.target.value)} 
                        className="w-full p-3 text-sm font-semibold rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 transition-all placeholder:font-normal" 
                        placeholder="e.g. EIN-12345678"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Clinic Logo</label>
                    <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      {clinicLogoUrl ? (
                        <img src={clinicLogoUrl} alt="Clinic Logo" className="w-16 h-16 object-contain border border-slate-200 rounded-xl bg-white shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                          <DentoraLogo className="w-10 h-10 opacity-50 grayscale" />
                        </div>
                      )}
                      <div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                        />
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-sm transition"
                        >
                          {isUploadingLogo ? 'Uploading...' : (clinicLogoUrl ? 'Change Logo' : 'Upload Logo')}
                        </button>
                        <p className="text-[11px] text-slate-500 mt-2">For best PDF results, upload a transparent PNG.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={isSavingClinic}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition shadow-sm"
                    >
                      {isSavingClinic ? 'Saving...' : 'Save Details'}
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900">Practice Locations</h2>
                <p className="text-xs text-slate-500 mt-1">Manage physical clinics and operatory equipment.</p>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  Active Locations ({locations.length})
                </h3>
                <button 
                  onClick={() => setShowAddLocation(!showAddLocation)}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 font-bold text-xs rounded-xl hover:bg-teal-100 transition shadow-sm"
                >
                  {showAddLocation ? '- Cancel' : '+ Add Location'}
                </button>
              </div>

              <AnimatePresence>
                {showAddLocation && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddLocation}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Location Name</label>
                        <input type="text" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} placeholder="e.g. Downtown Clinic" className="w-full p-2.5 text-xs rounded-xl border border-slate-200" required />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Location Code</label>
                        <input type="text" value={newLocationCode} onChange={(e) => setNewLocationCode(e.target.value)} placeholder="e.g. DWT" className="w-full p-2.5 text-xs rounded-xl border border-slate-200" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Address</label>
                        <input type="text" value={newLocationAddress} onChange={(e) => setNewLocationAddress(e.target.value)} placeholder="e.g. 123 Main St" className="w-full p-2.5 text-xs rounded-xl border border-slate-200" />
                      </div>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-sm">
                      Save Location
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {locations.map(loc => {
                  const locOps = operatories.filter(op => op.locationId === loc.id);
                  return (
                  <div key={loc.id} className="group relative p-6 rounded-3xl border border-slate-200 hover:border-teal-400 bg-white shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="font-black text-slate-900 text-lg block leading-tight">{loc.name}</span>
                          <span className="text-xs text-slate-500">{loc.address}</span>
                        </div>
                        <span className="font-mono text-[10px] text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-lg font-bold shadow-sm">
                          {loc.code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-5 mt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {loc.phone}</span>
                        <span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100">{loc.operatingHours?.open || '08:00'} - {loc.operatingHours?.close || '17:00'}</span>
                        <span className="text-teal-700">{locOps.length} Operatories</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => openLocationEditor(loc)}
                      className="relative z-10 mt-5 w-full py-3 rounded-xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 text-slate-600 hover:text-teal-700 text-xs font-black transition-all flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit & Manage Location
                    </button>
                  </div>
                )})}
              </div>

              {/* Location Editor Modal */}
              <AnimatePresence>
                {editingLocationId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
                    >
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Edit Location</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Manage details and operatories for {editLocName}</p>
                        </div>
                        <button onClick={() => setEditingLocationId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        <form id="location-details-form" onSubmit={handleUpdateLocation} className="space-y-4">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-teal-600" /> Location Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Location Name</label>
                              <input type="text" value={editLocName} onChange={(e) => setEditLocName(e.target.value)} className="w-full p-2.5 text-xs rounded-xl border border-slate-200" required />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Location Code</label>
                              <input type="text" value={editLocCode} onChange={(e) => setEditLocCode(e.target.value)} className="w-full p-2.5 text-xs rounded-xl border border-slate-200" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                              <input type="text" value={editLocPhone} onChange={(e) => setEditLocPhone(e.target.value)} className="w-full p-2.5 text-xs rounded-xl border border-slate-200" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Operating Hours</label>
                              <div className="flex items-center gap-2">
                                <input type="time" value={editLocOpen} onChange={(e) => setEditLocOpen(e.target.value)} className="w-full p-2 text-xs rounded-xl border border-slate-200" required />
                                <span className="text-slate-400">-</span>
                                <input type="time" value={editLocClose} onChange={(e) => setEditLocClose(e.target.value)} className="w-full p-2 text-xs rounded-xl border border-slate-200" required />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="text-xs font-bold text-slate-700 block mb-1">Address</label>
                              <input type="text" value={editLocAddress} onChange={(e) => setEditLocAddress(e.target.value)} className="w-full p-2.5 text-xs rounded-xl border border-slate-200" />
                            </div>
                          </div>
                        </form>

                        <div className="border-t border-slate-100 pt-8">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-indigo-600" /> Operatory Rooms
                            </h4>
                            <button 
                              onClick={() => setAddingOperatoryToLocation(addingOperatoryToLocation === editingLocationId ? null : editingLocationId)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Room
                            </button>
                          </div>

                          <AnimatePresence>
                            {addingOperatoryToLocation === editingLocationId && (
                              <motion.form 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={(e) => handleAddOperatory(e, editingLocationId)}
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner space-y-4 mb-4 overflow-hidden"
                              >
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Room Name</label>
                                    <input type="text" value={newOpName} onChange={(e) => setNewOpName(e.target.value)} placeholder="e.g. Surgery A" className="w-full p-2.5 text-xs rounded-xl border border-slate-200" required />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1">Equipment Type</label>
                                    <input type="text" value={newOpType} onChange={(e) => setNewOpType(e.target.value)} placeholder="e.g. Standard" className="w-full p-2.5 text-xs rounded-xl border border-slate-200" required />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={newOpIsHygiene} onChange={(e) => setNewOpIsHygiene(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                    This is primarily a Hygiene Room
                                  </label>
                                  <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm">
                                    Save Room
                                  </button>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>

                          {(() => {
                            const currentOps = operatories.filter(op => op.locationId === editingLocationId);
                            if (currentOps.length === 0) {
                              return <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No rooms added yet.</p>;
                            }
                            return (
                              <div className="space-y-2">
                                {currentOps.map(op => (
                                  <div key={op.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition">
                                    <div>
                                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        {op.name}
                                        {op.isHygiene && <span className="text-[9px] uppercase tracking-wider font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Hygiene</span>}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-0.5">Type: {op.equipmentType}</p>
                                    </div>
                                    <button 
                                      onClick={() => removeOperatory(op.id)}
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Delete Room"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                        <button 
                          onClick={() => setEditingLocationId(null)}
                          className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition shadow-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          form="location-details-form"
                          type="submit" 
                          className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}



          {/* WHATSAPP INTEGRATION */}
          {activeTab === 'whatsapp' && (
            <motion.div key="whatsapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl space-y-8">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    WhatsApp Integrations (UltraMsg)
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Enable</span>
                    <button 
                      type="button" 
                      onClick={() => setWaEnabled(!waEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${waEnabled ? 'bg-teal-500' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${waEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveWhatsApp} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Instance ID</label>
                      <input 
                        type="text" 
                        value={waInstanceId} 
                        onChange={(e) => setWaInstanceId(e.target.value)} 
                        className="w-full p-3 text-sm font-semibold rounded-xl bg-white border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 transition-all placeholder:font-normal" 
                        placeholder="e.g. instance187190"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Token</label>
                      <input 
                        type="password" 
                        value={waToken} 
                        onChange={(e) => setWaToken(e.target.value)} 
                        className="w-full p-3 text-sm font-semibold rounded-xl bg-white border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500 transition-all placeholder:font-normal" 
                        placeholder="Your UltraMsg Token"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800">Message Templates</h4>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Appointment Booked</label>
                      <textarea 
                        value={waApptBookedTemplate} 
                        onChange={(e) => setWaApptBookedTemplate(e.target.value)} 
                        rows={2}
                        className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Appointment Reminder</label>
                      <textarea 
                        value={waApptReminderTemplate} 
                        onChange={(e) => setWaApptReminderTemplate(e.target.value)} 
                        rows={2}
                        className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Invoice Message</label>
                      <textarea 
                        value={waInvoiceTemplate} 
                        onChange={(e) => setWaInvoiceTemplate(e.target.value)} 
                        rows={2}
                        className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Record Message</label>
                      <textarea 
                        value={waClinicalTemplate} 
                        onChange={(e) => setWaClinicalTemplate(e.target.value)} 
                        rows={2}
                        className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500" 
                      />
                    </div>

                    <div className="p-3 bg-teal-50 text-teal-800 text-xs rounded-xl border border-teal-100 flex gap-2">
                      <span className="font-bold">Hint:</span>
                      Use variables like {'{PatientName}'}, {'{Date}'}, {'{Time}'}, and {'{ClinicName}'}. Use asterisks for *bold* text.
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-800 mb-4">Invoice Delivery Workflow</h4>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">When generating an invoice:</label>
                        <select 
                          value={waInvoiceDeliveryMode}
                          onChange={(e) => setWaInvoiceDeliveryMode(e.target.value as any)}
                          className="w-full p-3 text-sm font-bold rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="auto">Automatically send invoice via WhatsApp</option>
                          <option value="ask">Ask before sending via WhatsApp</option>
                          <option value="manual">Never send automatically (Manual only)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={isSavingWA}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition shadow-sm"
                    >
                      {isSavingWA ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* SYSTEM PREFERENCES */}
          {activeTab === 'system' && (
            <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl space-y-8">
              <div>
                <h2 className="text-lg font-black text-slate-900">System Preferences</h2>
                <p className="text-xs text-slate-500 mt-1">Configure global application behavior.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <form onSubmit={handleSaveSystem} className="space-y-6">
                  <div className="space-y-2 text-sm">
                    <label className="font-bold text-slate-700 block">Country</label>
                    <select
                      value={clinicCountry}
                      onChange={(e) => setClinicCountry(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 hover:border-teal-400 transition"
                    >
                      <option value="USA">United States</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="UK">United Kingdom</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-[11px] text-slate-500">Determines localization settings (Currency, Time Zone) automatically.</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <label className="font-bold text-slate-700 block">Time Format</label>
                    <select 
                      value={sysTimeFormat}
                      onChange={(e) => setSysTimeFormat(e.target.value as '12h' | '24h')}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 hover:border-teal-400 transition"
                    >
                      <option value="12h">12-hour (e.g. 2:30 PM)</option>
                      <option value="24h">24-hour (e.g. 14:30)</option>
                    </select>
                    <p className="text-[11px] text-slate-500">How time is displayed across calendars and records.</p>
                  </div>



                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingSystem}
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition shadow-sm"
                    >
                      {isSavingSystem ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* STAFF MANAGEMENT */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Staff Management</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage Dentists and Administrators.</p>
                </div>
                {!showAddDoctor && (
                  <button 
                    onClick={() => setShowAddDoctor(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Provider
                  </button>
                )}
              </div>

              {showAddDoctor && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-600" />
                    New Provider Details
                  </h3>
                  <form onSubmit={handleAddDoctor} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={newDoctorName} 
                        onChange={(e) => setNewDoctorName(e.target.value)} 
                        className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" 
                        placeholder="e.g. Dr. Jane Smith"
                        required 
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Specialty</label>
                      <input 
                        type="text" 
                        value={newDoctorSpecialty} 
                        onChange={(e) => setNewDoctorSpecialty(e.target.value)} 
                        className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" 
                        placeholder="e.g. General Dentistry"
                        required 
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button type="button" onClick={() => setShowAddDoctor(false)} className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-sm transition">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => (
                  <div key={provider.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 group hover:border-teal-200 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner" style={{ backgroundColor: provider.color }}>
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{provider.name}</h4>
                        <p className="text-xs font-semibold text-slate-500">{provider.title} • {provider.specialty}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {providers.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600">No providers found</p>
                    <p className="text-xs text-slate-500 mt-1">Add your first dentist or administrator to get started.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Billing & Service Catalog</h2>
                  <p className="text-xs text-slate-500 mt-1">Manage billable services and default pricing.</p>
                </div>
                {!isAddingService && (
                  <button 
                    onClick={() => setIsAddingService(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </button>
                )}
              </div>

              {isAddingService && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    New Clinic Service
                  </h3>
                  <form onSubmit={handleAddService} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Service Name</label>
                      <input 
                        type="text" 
                        value={newServiceName} 
                        onChange={(e) => setNewServiceName(e.target.value)} 
                        className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" 
                        placeholder="e.g. Root Canal Therapy"
                        required 
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Default Price ({currencySymbol})</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={newServicePrice} 
                        onChange={(e) => setNewServicePrice(e.target.value)} 
                        className="w-full p-2.5 text-sm rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500" 
                        placeholder="0.00"
                        required 
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button type="button" onClick={() => setIsAddingService(false)} className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl transition">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-sm transition">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Name</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Price</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clinicServices.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-slate-500 text-sm">
                            No services have been added to the catalog yet.
                          </td>
                        </tr>
                      ) : (
                        clinicServices.map(service => (
                          <tr key={service.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 font-medium text-slate-900 text-sm">{service.name}</td>
                            <td className="p-4 text-slate-600 text-sm font-semibold">{currencySymbol}{service.defaultPrice.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
                                    deleteClinicService(service.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}



        </AnimatePresence>
      </div>
    </div>
  );
};

