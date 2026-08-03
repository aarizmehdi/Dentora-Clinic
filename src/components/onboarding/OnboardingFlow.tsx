import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { Building2, UserPlus, Sparkles, ArrowRight, CheckCircle2, ChevronRight, LayoutDashboard, Calendar, Activity } from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { clinic, updateClinic, addProvider } = useDentora();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 State
  const [clinicName, setClinicName] = useState(clinic?.name || '');
  const [country, setCountry] = useState(clinic?.country || 'USA');

  // Step 2 State
  const [providerName, setProviderName] = useState('');
  const [specialty, setSpecialty] = useState('General Dentistry');

  // Tour State
  const [tourIndex, setTourIndex] = useState(0);
  const tourSlides = [
    {
      title: 'Powerful Dashboard Insights',
      desc: 'Get a bird\'s eye view of your practice performance, upcoming appointments, and daily collections.',
      icon: LayoutDashboard,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Intelligent Scheduling',
      desc: 'Seamlessly drag-and-drop appointments, manage operatory columns, and prevent double-booking automatically.',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Interactive Odontogram',
      desc: 'Chart conditions natively. Point, click, and create treatment plans with accurate CDT codes instantly.',
      icon: Activity,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    }
  ];

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    
    // Save Provider
    if (providerName) {
      await addProvider({
        name: providerName,
        title: 'D.D.S.',
        specialty,
        color: '#10B981', // Emerald
        locationIds: [] // Assuming default or handles gracefully
      });
    }

    // Save Clinic & Complete Onboarding
    await updateClinic({
      name: clinicName,
      country,
      isOnboarded: true
    });
  };

  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Panel - Dynamic Branding/Graphic */}
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
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            Dentora
          </div>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Welcome to the future of dental management.</h1>
                <p className="text-slate-400 text-lg">Let's set up your practice environment in seconds.</p>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Empower your clinical team.</h1>
                <p className="text-slate-400 text-lg">Add your first provider to start booking appointments instantly.</p>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Everything you need, built right in.</h1>
                <p className="text-slate-400 text-lg">Take a quick tour of what Dentora has to offer.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-12 bg-teal-500' : 'w-4 bg-slate-700'}`} />
          ))}
        </div>
      </motion.div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PRACTICE DETAILS */}
          {step === 1 && (
            <motion.div key="form1" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-md space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Practice Setup</h2>
                <p className="text-slate-500 mt-2">We'll use this to localize your currency and timezone.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Practice Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:font-normal"
                      placeholder="e.g. Dentora Premier Care"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Country / Region</label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="USA">United States</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="UK">United Kingdom</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleNextStep}
                disabled={!clinicName}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: STAFF SETUP */}
          {step === 2 && (
            <motion.div key="form2" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-md space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add a Provider</h2>
                <p className="text-slate-500 mt-2">Who will be seeing patients first?</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserPlus className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:font-normal"
                      placeholder="e.g. Dr. Jane Smith"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Specialty</label>
                  <input 
                    type="text" 
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:font-normal"
                    placeholder="e.g. General Dentistry"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button 
                  onClick={handleNextStep}
                  disabled={!providerName}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <button onClick={handleNextStep} className="text-sm font-bold text-slate-400 hover:text-slate-600">
                  Skip this step
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TOUR */}
          {step === 3 && (
            <motion.div key="form3" initial={fadeVariant.hidden} animate={fadeVariant.visible} exit={fadeVariant.exit} className="w-full max-w-lg space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">Platform Tour</h2>
                <p className="text-slate-500 mt-2">A quick look at what you can do.</p>
              </div>

              <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
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
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{tourSlides[tourIndex].title}</h3>
                    <p className="text-slate-500 leading-relaxed max-w-sm">
                      {tourSlides[tourIndex].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
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
                    {isSubmitting ? 'Launching...' : 'Launch Dentora'} 
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

                <div className="w-10 opacity-0" /> {/* Spacer for centering */}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
