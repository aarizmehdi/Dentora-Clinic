import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

export const AppSkeleton: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-8 h-8 rounded-xl bg-slate-200"
          />
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            className="h-5 w-32 bg-slate-200 rounded-md"
          />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="h-10 w-full bg-slate-100 rounded-xl"
            />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar Skeleton */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-6 w-48 bg-slate-200 rounded-md"
          />
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-8 h-8 rounded-full bg-slate-200"
            />
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="w-8 h-8 rounded-full bg-slate-200"
            />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-12 w-1/3 bg-slate-200 rounded-xl"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="h-28 bg-white border border-slate-200 rounded-2xl shadow-sm"
              />
            ))}
          </div>
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="h-64 bg-white border border-slate-200 rounded-2xl shadow-sm w-full mt-6 flex items-center justify-center"
          >
            <Stethoscope className="w-12 h-12 text-slate-200 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
