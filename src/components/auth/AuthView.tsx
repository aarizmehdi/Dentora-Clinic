import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { Building2, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, registerClinic } = useDentora();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="relative min-h-screen w-full bg-[#F1F5F9] flex items-center justify-center p-4 sm:p-8 overflow-hidden selection:bg-teal-500 selection:text-white">
      
      {/* Animated Background Gradients */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-300/30 mix-blend-multiply filter blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-300/30 mix-blend-multiply filter blur-[120px]"
      />
      <motion.div 
        animate={{ y: [0, -20, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-[100px]"
      />

      {/* Main Glassmorphic Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1000px] max-h-[90vh] bg-white/70 backdrop-blur-3xl border border-white/80 rounded-[2.5rem] shadow-2xl shadow-slate-300/50 flex flex-col md:flex-row overflow-hidden"
      >
        
        {/* Left Side: Premium Dental Animation & Brand */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#2E8081] to-teal-700 p-10 flex-col justify-between relative overflow-hidden">
          {/* Decorative inner circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white text-3xl font-black tracking-tight flex items-center gap-2"
            >
              Dentora
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-teal-100/90 font-medium mt-2"
            >
              The intelligent clinic management system.
            </motion.p>
          </div>
          
          {/* Animated SVG Tooth Component */}
          <div className="relative z-10 flex items-center justify-center flex-1 py-8">
            <motion.div
              animate={{ y: [-12, 12, -12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
              
              <svg viewBox="0 0 100 100" className="w-56 h-56 drop-shadow-2xl relative z-10">
                <defs>
                  <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ccfbf1" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Main Tooth Body */}
                <motion.path
                  d="M 25 35 C 25 15, 40 10, 50 20 C 60 10, 75 15, 75 35 C 75 55, 80 65, 70 80 C 60 95, 50 85, 50 70 C 50 85, 40 95, 30 80 C 20 65, 25 55, 25 35 Z"
                  fill="url(#toothGrad)"
                  stroke="rgba(255,255,255,1)"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
                  animate={{ pathLength: 1, opacity: 1, scale: 1 }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                />
                
                {/* Shine lines */}
                <motion.path
                  d="M 35 28 Q 50 18 65 28"
                  stroke="rgba(46, 128, 129, 0.15)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                />
                <motion.path
                  d="M 30 45 Q 35 60 38 75"
                  stroke="rgba(46, 128, 129, 0.15)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 1 }}
                />
              </svg>
            </motion.div>
          </div>

          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
                <span className="text-white font-bold text-sm">Enterprise Security</span>
              </div>
              <p className="text-teal-50 font-medium text-[13px] leading-relaxed">
                Your practice data is fully encrypted and securely backed up in real-time.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Form (Scrollable to prevent overflow) */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 overflow-y-auto">
          <div className="max-w-[380px] mx-auto w-full h-full flex flex-col justify-center min-h-full">
            
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h3>
              <p className="text-[15px] font-medium text-slate-500">
                {isLogin ? 'Sign in to access your practice data.' : 'Register your clinic in seconds.'}
              </p>
            </div>
            
            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Clinic Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Building2 className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                          placeholder="Acme Dental"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Admin Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                          placeholder="Dr. Jane Smith"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
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
                    className="p-4 bg-rose-50/80 backdrop-blur border border-rose-100 text-rose-600 text-[13px] font-bold rounded-2xl flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl shadow-lg shadow-teal-500/25 text-[15px] font-bold text-white bg-[#2E8081] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                      <ArrowRight className="w-[18px] h-[18px] opacity-80" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-200/60 text-center">
              <p className="text-[13px] font-semibold text-slate-500 mb-4">
                {isLogin ? 'New to Dentora?' : 'Already have a clinic?'}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full flex justify-center py-3.5 px-4 border-2 border-slate-200/80 rounded-2xl text-[14px] font-bold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none transition-all"
              >
                {isLogin ? 'Register a New Clinic' : 'Sign in to Existing Clinic'}
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
