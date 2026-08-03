import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentora } from '../../context/DentoraContext';
import { Building2, User, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-teal-500 selection:text-white">
      
      {/* Left Side: Edge-to-edge High-End Photography */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1120] overflow-hidden flex-col justify-between p-12 xl:p-20">
        
        {/* Background Image */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1974&auto=format&fit=crop')` }}
        />
        
        {/* Rich Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090E17] via-[#090E17]/80 to-[#090E17]/30" />
        <div className="absolute inset-0 bg-teal-900/30 mix-blend-multiply" />

        {/* Content Top: Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <Sparkles className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-white text-3xl font-black tracking-tight">Dentora</h2>
        </div>
        
        {/* Content Bottom: Value Prop */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Elevate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
                dental practice.
              </span>
            </h1>
            <p className="text-slate-300 font-medium text-lg xl:text-xl max-w-md mb-10 leading-relaxed">
              Experience the future of clinic management with intelligent charting, automated workflows, and seamless patient communication.
            </p>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 xl:p-8 border border-white/10 shadow-2xl max-w-lg">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-white font-bold text-lg">Enterprise Security</span>
              </div>
              <p className="text-slate-300 font-medium text-sm xl:text-base leading-relaxed pl-14">
                Your patient data is fully encrypted, HIPAA-compliant ready, and securely backed up in real-time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Edge-to-edge Clean Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white px-6 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto relative">
        
        {/* Subtle decorative mesh gradient on the form side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-[100px] pointer-events-none -mt-40 -mr-40" />

        <div className="w-full max-w-[420px] mx-auto py-12 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              {/* Mobile Only Logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-3xl text-slate-900 tracking-tight">Dentora</span>
              </div>
              
              <h3 className="text-3xl xl:text-4xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
                {isLogin ? 'Welcome back' : 'Create workspace'}
              </h3>
              <p className="text-base font-medium text-slate-500">
                {isLogin ? 'Enter your credentials to securely access your practice.' : 'Set up your clinic and get started in seconds.'}
              </p>
            </div>
            
            {/* Form */}
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
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Clinic Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                          placeholder="Acme Dental"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Admin Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        </div>
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                          placeholder="Dr. Jane Smith"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={!isLogin ? "mt-5" : ""}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
                    placeholder="doctor@clinic.com"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white text-[15px] font-medium transition-all placeholder:font-normal placeholder:text-slate-400"
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
                    className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-xl flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-teal-500/25 text-base font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Workspace'}
                      <ArrowRight className="w-5 h-5 opacity-90" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm font-semibold text-slate-500 mb-4">
                {isLogin ? 'New to Dentora?' : 'Already have a clinic?'}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full flex justify-center py-4 px-4 rounded-xl text-[15px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {isLogin ? 'Register a New Clinic' : 'Sign in to Existing Clinic'}
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};
