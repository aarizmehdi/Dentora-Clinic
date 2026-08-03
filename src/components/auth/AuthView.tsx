import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { Loader2 } from 'lucide-react';

const DentoraLogo = () => (
  <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
    <path d="M10 8H22C28.6274 8 34 13.3726 34 20C34 26.6274 28.6274 32 22 32H10V8Z" fill="url(#paint0_linear)" />
    <path d="M16 14H22C25.3137 14 28 16.6863 28 20C28 23.3137 25.3137 26 22 26H16V14Z" fill="white" />
    <defs>
      <linearGradient id="paint0_linear" x1="10" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F766E" />
        <stop offset="1" stopColor="#2DD4BF" />
      </linearGradient>
    </defs>
  </svg>
);

const AnimatedBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-[#fafafa]">
    {/* Dotted Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.4]" 
      style={{
        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }} 
    />
    
    {/* Animated Aurora Gradients */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.6, 0.4],
        rotate: [0, 45, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-teal-200/40 to-emerald-100/40 blur-[100px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.5, 0.3],
        rotate: [0, -45, 0]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-cyan-200/30 to-teal-100/30 blur-[100px]"
    />

    {/* Floating Geometric Wireframes */}
    <motion.svg
      animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[15%] left-[10%] w-48 h-48 text-teal-900/[0.03]"
      viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 5L93.3013 30V80L50 105L6.69873 80V30L50 5Z" stroke="currentColor" strokeWidth="1"/>
      <path d="M50 5V55L93.3013 30" stroke="currentColor" strokeWidth="1"/>
      <path d="M50 55L6.69873 30" stroke="currentColor" strokeWidth="1"/>
      <path d="M50 55V105" stroke="currentColor" strokeWidth="1"/>
    </motion.svg>

    <motion.svg
      animate={{ y: [0, 40, 0], rotate: [0, -20, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[20%] right-[10%] w-56 h-56 text-teal-900/[0.03]"
      viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1"/>
      <rect x="35" y="35" width="30" height="30" stroke="currentColor" strokeWidth="1" transform="rotate(45 50 50)"/>
    </motion.svg>
  </div>
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
    <div className="min-h-screen w-full flex items-center justify-center relative selection:bg-teal-500 selection:text-white p-4">
      
      <AnimatedBackground />
      
      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10">
        
        {/* Logo & Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="mb-6">
            <DentoraLogo />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isLogin ? 'Log in to Dentora' : 'Create workspace'}
          </h2>
          <p className="mt-3 text-[15px] text-slate-500 font-medium max-w-[280px]">
            {isLogin ? 'Enter your details below to access your clinic.' : 'Set up your clinic and get started in seconds.'}
          </p>
        </motion.div>

        {/* Form Container (Glassmorphic Vercel Style) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="w-full bg-white/70 backdrop-blur-xl sm:border border-white/50 sm:rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-4 sm:p-8 relative overflow-hidden"
        >
          {/* Subtle top glare for glass effect */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          
          <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
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
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Clinic Name</label>
                    <input
                      type="text"
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-[14px] font-medium transition-all placeholder:text-slate-400 placeholder:font-normal"
                      placeholder="Acme Dental"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-[14px] font-medium transition-all placeholder:text-slate-400 placeholder:font-normal"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-[14px] font-medium transition-all placeholder:text-slate-400 placeholder:font-normal"
                placeholder="doctor@clinic.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-[14px] font-medium transition-all placeholder:text-slate-400 placeholder:font-normal"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 p-3.5 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 text-[13px] font-medium rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-[14px] font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
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

          <div className="mt-8 pt-6 border-t border-slate-200/50 text-center relative z-10">
            <p className="text-[13px] text-slate-500 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-bold text-teal-600 hover:text-teal-700 hover:underline focus:outline-none transition-colors"
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
