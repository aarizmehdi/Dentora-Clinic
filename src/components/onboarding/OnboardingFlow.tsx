import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { 
  Building2, UserPlus, Sparkles, ArrowRight, Clock, MapPin, 
  Phone, Stethoscope, ChevronRight, LayoutDashboard, Calendar, Activity, CheckCircle2 
} from 'lucide-react';
import { DentoraLogo } from '../common/DentoraLogo';

export const OnboardingFlow: React.FC = () => {
  const { 
    clinic, updateClinic, locations, updateLocation, 
    providers, updateProvider, currentUser, updateUser, 
    operatories, updateOperatory, addOperatory 
  } = useDentora();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Practice & Invoice Details
  const [clinicName, setClinicName] = useState(clinic?.name || '');
  const [clinicPhone, setClinicPhone] = useState(locations[0]?.phone || '');
  const [clinicAddress, setClinicAddress] = useState(locations[0]?.address || '');
  const [country, setCountry] = useState(clinic?.country || 'Pakistan');

  // Step 2: Hours & Operatories
  const [openTime, setOpenTime] = useState(locations[0]?.operatingHours?.open || '09:00');
  const [closeTime, setCloseTime] = useState(locations[0]?.operatingHours?.close || '18:00');
  const [room1Name, setRoom1Name] = useState('Operatory 1');
  const [addSecondRoom, setAddSecondRoom] = useState(false);
  const [room2Name, setRoom2Name] = useState('Operatory 2 (Hygiene)');

  // Step 3: Doctor / Admin Setup
  const [doctorName, setDoctorName] = useState(currentUser?.name !== 'Admin' ? (currentUser?.name || '') : '');
  const [doctorTitle, setDoctorTitle] = useState('D.D.S.');
  const [specialty, setSpecialty] = useState('General Dentistry');

  // Tour State
  const [tourIndex, setTourIndex] = useState(0);
  const tourSlides = [
    {
      title: 'Powerful Dashboard Insights',
      desc: 'Get a bird\'s eye view of practice performance, appointments, and daily collections.',
      icon: LayoutDashboard,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Intelligent Scheduling',
      desc: 'Drag-and-drop appointments, manage operatory columns, and prevent double-booking.',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Interactive Odontogram & Invoicing',
      desc: 'Chart conditions, generate professional PDFs, and send invoices instantly.',
      icon: Activity,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    }
  ];

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    
    try {
      // Derive country code
      let code = '1';
      if (country === 'Pakistan') code = '92';
      if (country === 'UK') code = '44';
      if (country === 'India') code = '91';

      const mainLocationId = locations[0]?.id || `loc_${Date.now()}`;

      // 1. Update primary location details (Address, Phone, Operating Hours)
      if (locations.length > 0) {
        await updateLocation(locations[0].id, {
          name: clinicName ? `${clinicName} - Main` : 'Main Location',
          address: clinicAddress || 'Main Street',
          phone: clinicPhone || '(051) 000-0000',
          operatingHours: {
            open: openTime,
            close: closeTime,
          }
        });
      }

      // 2. Update Current User Profile (replaces default "Admin")
      if (doctorName) {
        await updateUser({
          name: doctorName,
          title: doctorTitle ? `${doctorTitle} • ${specialty}` : 'Clinic Administrator',
        });
      }

      // 3. Update Default Primary Provider (replaces default "Admin" provider)
      if (providers.length > 0 && doctorName) {
        await updateProvider(providers[0].id, {
          name: doctorName,
          title: doctorTitle || 'D.D.S.',
          specialty: specialty || 'General Dentistry',
        });
      }

      // 4. Update or Add Primary Room 1
      if (operatories.length > 0) {
        await updateOperatory(operatories[0].id, {
          name: room1Name || 'Operatory 1',
          locationId: mainLocationId,
        });
      } else {
        await addOperatory({
          name: room1Name || 'Operatory 1',
          locationId: mainLocationId,
          equipmentType: 'Standard',
          isHygiene: false,
        });
      }

      // 5. Add Second Room if selected
      if (addSecondRoom && room2Name) {
        await addOperatory({
          name: room2Name,
          locationId: mainLocationId,
          equipmentType: 'Standard',
          isHygiene: true,
        });
      }

      // 5. Complete Onboarding in Clinic doc
      await updateClinic({
        name: clinicName || 'Dental Practice',
        country,
        countryCode: code,
        isOnboarded: true
      });
    } catch (e) {
      console.error('Error completing onboarding:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel - Dynamic Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex md:w-1/3 lg:w-2/5 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-slate-900 z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-black mb-12">
            <DentoraLogo className="w-10 h-10" />
            Dentora
          </div>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Welcome to Dentora Practice Management.</h1>
                <p className="text-slate-400 text-lg">Let's set up your practice & invoice information.</p>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Configure Clinic Schedule & Rooms.</h1>
                <p className="text-slate-400 text-lg">Set operating hours and treatment operatories.</p>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Identify the Lead Practitioner.</h1>
                <p className="text-slate-400 text-lg">Personalize your doctor profile for charts & appointment calendars.</p>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Everything is configured & ready.</h1>
                <p className="text-slate-400 text-lg">Take a quick tour before launching your workspace.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-10 bg-teal-500' : 'w-3 bg-slate-700'}`} />
          ))}
        </div>
      </motion.div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PRACTICE & INVOICE DETAILS */}
          {step === 1 && (
            <motion.div key="form1" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-md space-y-6">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-1">Step 1 of 3</span>
                <h2 className="text-2xl font-black text-slate-900">Practice & Invoice Details</h2>
                <p className="text-slate-500 text-xs mt-1">This information will appear on official patient invoices and receipts.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Practice Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building2 className="w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-sm transition-all placeholder:font-normal"
                      placeholder="e.g. Dentora Premier Dental Care"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Clinic Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-sm transition-all placeholder:font-normal"
                      placeholder="e.g. +92 300 1234567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Full Address (for Invoices)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-sm transition-all placeholder:font-normal"
                      placeholder="e.g. Suite 402, Medical Complex, Main Boulevard"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Country / Region</label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-sm transition-all cursor-pointer"
                  >
                    <option value="Pakistan">Pakistan (Rs.)</option>
                    <option value="USA">United States ($)</option>
                    <option value="UK">United Kingdom (£)</option>
                    <option value="India">India (₹)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleNextStep}
                disabled={!clinicName || !clinicPhone}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                Next: Hours & Rooms <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: HOURS & OPERATORIES */}
          {step === 2 && (
            <motion.div key="form2" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-md space-y-6">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-1">Step 2 of 3</span>
                <h2 className="text-2xl font-black text-slate-900">Hours & Operatories</h2>
                <p className="text-slate-500 text-xs mt-1">Configure appointment calendar bounds and treatment room layout.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Operating Hours
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold mb-1 block">Opening Time</span>
                      <input 
                        type="time" 
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold mb-1 block">Closing Time</span>
                      <input 
                        type="time" 
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Primary Operatory Room</label>
                  <input 
                    type="text" 
                    value={room1Name}
                    onChange={(e) => setRoom1Name(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 text-sm"
                    placeholder="e.g. Operatory 1 / Surgery A"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/80">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={addSecondRoom}
                      onChange={(e) => setAddSecondRoom(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Add a 2nd Treatment Room right now</span>
                  </label>

                  {addSecondRoom && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                      <input 
                        type="text" 
                        value={room2Name}
                        onChange={(e) => setRoom2Name(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs"
                        placeholder="e.g. Hygiene Room B"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleNextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  Next: Doctor Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LEAD DOCTOR SETUP (Fixes Admin default!) */}
          {step === 3 && (
            <motion.div key="form3" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-md space-y-6">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-1">Step 3 of 3</span>
                <h2 className="text-2xl font-black text-slate-900">Lead Doctor Profile</h2>
                <p className="text-slate-500 text-xs mt-1">Replace default admin name with your official practitioner title.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Doctor Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Stethoscope className="w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-sm transition-all placeholder:font-normal"
                      placeholder="e.g. Dr. Aariz Mehdi"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Title</label>
                    <select
                      value={doctorTitle}
                      onChange={(e) => setDoctorTitle(e.target.value)}
                      className="w-full px-3 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 text-sm"
                    >
                      <option value="D.D.S.">D.D.S.</option>
                      <option value="D.M.D.">D.M.D.</option>
                      <option value="B.D.S.">B.D.S.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Specialty</label>
                    <input 
                      type="text" 
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 text-sm"
                      placeholder="e.g. General Dentistry"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleNextStep}
                  disabled={!doctorName}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: TOUR & LAUNCH */}
          {step === 4 && (
            <motion.div key="form4" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-lg space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">Platform Tour</h2>
                <p className="text-slate-500 text-xs mt-1">A quick look at your new workspace.</p>
              </div>

              <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[280px] flex flex-col items-center justify-center p-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={tourIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`p-5 rounded-2xl border ${tourSlides[tourIndex].color} mb-6 shadow-sm`}>
                      {React.createElement(tourSlides[tourIndex].icon, { className: 'w-10 h-10' })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{tourSlides[tourIndex].title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                      {tourSlides[tourIndex].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
                  {tourSlides.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setTourIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${tourIndex === idx ? 'w-6 bg-teal-500' : 'bg-slate-200 hover:bg-slate-300'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center px-4">
                <button 
                  onClick={() => setTourIndex(prev => Math.max(0, prev - 1))}
                  className={`p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 ${tourIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                {tourIndex === tourSlides.length - 1 ? (
                  <button 
                    onClick={handleFinishOnboarding}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/30 transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? 'Launching...' : 'Launch Dentora Workspace'} 
                    {!isSubmitting && <Sparkles className="w-5 h-5" />}
                  </button>
                ) : (
                  <button 
                    onClick={() => setTourIndex(prev => Math.min(tourSlides.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="w-10 opacity-0" />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
