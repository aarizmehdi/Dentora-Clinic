import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { Building2, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F1F5F9] p-4 sm:p-8 selection:bg-teal-500 selection:text-white">
      
      {/* Compact Floating Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[880px] bg-white rounded-3xl shadow-xl shadow-slate-200/80 flex flex-col md:flex-row overflow-hidden border border-slate-100"
      >
        
        {/* Left Side: Compact Photography */}
        <div className="hidden md:flex md:w-[45%] relative bg-[#0B1120] overflow-hidden flex-col justify-between p-10">
          
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1974&auto=format&fit=crop')` }}
          />
          
          {/* Rich Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090E17] via-[#090E17]/60 to-[#090E17]/20" />
          <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <h2 className="text-white text-2xl font-black tracking-tight">Dentora</h2>
          </div>
          
          {/* Bottom Content: Just the headline */}
          <div className="relative z-10">
            <h1 className="text-[2.5rem] font-black text-white leading-[1.1] tracking-tight">
              Elevate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
                dental practice.
              </span>
            </h1>
          </div>
        </div>

        {/* Right Side: Compact Form */}
        <div className="w-full md:w-[55%] flex flex-col justify-center bg-white p-8 sm:p-10 relative">
          
          <div className="w-full max-w-[360px] mx-auto relative z-10">
            
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              {/* Mobile Only Logo */}
              <div className="md:hidden flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-2xl text-slate-900 tracking-tight">Dentora</span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {isLogin ? 'Welcome back' : 'Create workspace'}
              </h3>
              <p className="text-[14px] font-medium text-slate-500">
                {isLogin ? 'Enter your credentials to securely access your practice.' : 'Set up your clinic and get started in seconds.'}
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
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 className="h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[14px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                          placeholder="Acme Dental"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Admin Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[14px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                          placeholder="Dr. Jane Smith"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={!isLogin ? "mt-4" : ""}>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[14px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[14px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-3 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg shadow-teal-500/20 text-[14px] font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                      <ArrowRight className="w-4 h-4 opacity-90" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-[12px] font-semibold text-slate-500 mb-3">
                {isLogin ? 'New to Dentora?' : 'Already have a clinic?'}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-[13px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
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
