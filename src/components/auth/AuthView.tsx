import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { Sparkles, Building2, User, Quote, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, registerClinic } = useDentora();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific
  const [clinicName, setClinicName] = useState('');
  const [adminName, setAdminName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await registerClinic(email, password, clinicName, adminName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white selection:bg-teal-500 selection:text-white">
      {/* Left Side - Hero / Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0B1120] overflow-hidden items-center justify-center">
        {/* Dynamic Abstract Background Gradients */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-teal-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2E8081] rounded-full mix-blend-screen filter blur-[140px] opacity-40" />
        <div className="absolute top-[40%] right-[-20%] w-[40%] h-[40%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20" />
        
        {/* Abstract Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 w-full max-w-lg p-12">
          {/* Brand Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl shadow-teal-500/20">
                <Sparkles className="w-6 h-6 text-teal-300" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Dentora<span className="text-teal-400">OS</span></h1>
            </div>
            
            <h2 className="text-5xl font-black text-white leading-[1.15] mb-6 tracking-tight">
              Modernize your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
                Dental Practice.
              </span>
            </h2>
            
            <p className="text-lg text-slate-300 font-medium leading-relaxed mb-12 max-w-md">
              Experience lightning-fast clinical charting, intelligent scheduling, and automated patient communication in one unified, beautiful workspace.
            </p>
            
            {/* Feature List */}
            <div className="space-y-4 mb-12">
              {[
                'Visual Odontogram & Perio Charting',
                'Automated WhatsApp Invoicing',
                'Smart Schedule Conflict Prevention'
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                  key={i} 
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <span className="text-slate-200 font-medium text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Glassmorphic Testimonial Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              <Quote className="w-8 h-8 text-teal-400/40 mb-4" />
              <p className="text-white/90 font-medium leading-relaxed mb-6 text-sm">
                "Dentora completely revolutionized how we manage our clinic. The charting is incredibly intuitive, and my patients love the WhatsApp reminders."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-500/30">
                  SM
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-wide">Dr. Sarah Mitchell</p>
                  <p className="text-xs text-teal-400 font-medium">Chief Dentist, SmileCare Studio</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#F8FAFC] relative">
        {/* Subtle background decoration for the form side */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none"></div>
        
        <div className="w-full max-w-[420px] relative z-10">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}>
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-3xl text-slate-900 tracking-tight">Dentora</span>
            </div>
            
            <div className="mb-10">
              <h2 className="text-[2rem] font-black text-slate-900 mb-3 tracking-tight leading-tight">
                {isLogin ? 'Welcome back' : 'Create workspace'}
              </h2>
              <p className="text-slate-500 font-medium text-[15px]">
                {isLogin ? 'Enter your details to securely access your practice.' : 'Set up your clinic in less than two minutes.'}
              </p>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Clinic Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="appearance-none block w-full pl-11 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:text-sm font-medium transition-all"
                          placeholder="e.g. Acme Dental Group"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Admin Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="appearance-none block w-full pl-11 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:text-sm font-medium transition-all"
                          placeholder="e.g. Dr. Jane Smith"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:text-sm font-medium transition-all"
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 sm:text-sm font-medium transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-bold rounded-2xl flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-teal-500/20 text-[15px] font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Workspace'}
                      <ArrowRight className="w-4 h-4 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[13px]">
                  <span className="px-4 bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider">
                    {isLogin ? 'New to Dentora?' : 'Already have a clinic?'}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="w-full flex justify-center py-3.5 px-4 border-2 border-slate-200 rounded-2xl text-[14px] font-bold text-slate-600 bg-transparent hover:bg-slate-50 hover:border-slate-300 focus:outline-none transition-all"
                >
                  {isLogin ? 'Register a New Clinic' : 'Sign in to Existing Clinic'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
