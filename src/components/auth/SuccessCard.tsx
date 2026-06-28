"use client";

import { motion } from "framer-motion";

export default function SuccessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-sm p-8 rounded-2xl bg-card shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col items-center text-center gap-4 transition-all duration-500"
    >
      {/* SVG Path-drawn Checkmark Micro-interaction */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 select-none">
        <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            d="M20 6L9 17L4 12"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-primary">Access Verified</h2>
      <p className="text-xs text-gray-500">Authentication successful. Entering Arena...</p>
    </motion.div>
  );
}
