import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';
import { DentoraLogo } from './DentoraLogo';

export const MobileBlocker: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fafafa] p-6 lg:hidden">
      {/* Background aurora */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.4]" 
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} 
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-teal-200/40 to-emerald-100/40 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-cyan-200/30 to-teal-100/30 blur-[100px]"
        />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
      >
        <div className="mb-8">
          <DentoraLogo />
        </div>

        {/* Icon animation */}
        <div className="relative mb-8">
          <motion.div
            animate={{ opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3"
          >
            <Smartphone className="w-10 h-10 text-slate-300" />
            <div className="flex gap-1">
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-slate-300"
              />
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="w-1.5 h-1.5 rounded-full bg-slate-300"
              />
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                className="w-1.5 h-1.5 rounded-full bg-slate-300"
              />
            </div>
            <Monitor className="w-12 h-12 text-teal-600" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Desktop Only
        </h2>
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed mb-8">
          Dentora is a practice management platform designed for desktop use. Please open this app on a computer for the best experience.
        </p>

        <div className="w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 shadow-[0_8px_40px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-slate-700">Recommended</p>
              <p className="text-[12px] text-slate-400 font-medium">
                Use a laptop or desktop with a screen width of 1024px or larger
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
