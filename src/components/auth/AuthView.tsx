import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { ArrowRight, Loader2 } from 'lucide-react';

const DentoraLogo = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#tealGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
    <path d="M12 21c-2 0-3-1-3-3v-2c0-1-1-2-2-2-1.66 0-3-1.34-3-3 0-2.21 1.79-4 4-4 .93 0 1.78.32 2.45.85C11.16 6.64 12.5 6 14 6c2.21 0 4 1.79 4 4 0 1.66-1.34 3-3 3-1 0-2 1-2 2v2c0 2-1 3-3 3z" />
    <defs>
      <linearGradient id="tealGrad" x1="0" y1="0" x2="24" y2="24">
        <stop stopColor="#0F766E"/>
        <stop offset="1" stopColor="#2DD4BF"/>
      </linearGradient>
    </defs>
  </svg>
);

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] selection:bg-teal-500 selection:text-white p-4">
      
      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10">
        
        {/* Logo & Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="mb-6">
            <DentoraLogo />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isLogin ? 'Log in to Dentora' : 'Create your workspace'}
          </h2>
          <p className="mt-2.5 text-[14.5px] text-slate-500 font-medium">
            {isLogin ? 'Enter your details below to access your clinic.' : 'Set up your clinic and get started in seconds.'}
          </p>
        </motion.div>

        {/* Form Container (Vercel Style) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full bg-white sm:border border-slate-200/80 sm:rounded-[20px] sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 sm:p-8"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Clinic Name</label>
                    <input
                      type="text"
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[14px] transition-all placeholder:text-slate-400"
                      placeholder="Acme Dental"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[14px] transition-all placeholder:text-slate-400"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[14px] transition-all placeholder:text-slate-400"
                placeholder="doctor@clinic.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[14px] transition-all placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-lg"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-[14px] font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Workspace'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-semibold text-slate-900 hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
