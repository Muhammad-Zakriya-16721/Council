"use client";

import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";

interface VerificationCardProps {
  email: string;
  onCancel: () => void;
}

export default function VerificationCard({ email, onCancel }: VerificationCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="w-full max-w-md p-8 rounded-2xl bg-card shadow-card flex flex-col items-center text-center gap-6 relative transition-all duration-500"
    >
      {/* Animated Envelope Icon */}
      <div className="relative flex items-center justify-center w-16 h-16 my-2 select-none">
        <motion.div
          animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-accent/20"
        />
        <motion.div
          animate={{ scale: [1, 1.4], opacity: [0.35, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-accent/15"
        />
        <div className="relative w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Mail className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary">Verify Your Email</h2>
        <p className="text-xs text-gray-500 max-w-[290px] mx-auto leading-relaxed">
          We sent a secure link to <span className="font-semibold text-primary">{email}</span>. Click the link in your email to confirm your identity and authorize this device.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-accent/5 text-accent text-xs font-semibold text-center flex items-center gap-2.5 justify-center leading-relaxed shadow-guest-btn">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Waiting for secure verification link click...</span>
      </div>

      <div className="w-full border-t border-card-border opacity-30 my-2"></div>

      {/* Cancel/Go Back Action */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="cursor-pointer text-[10px] text-gray-500 hover:text-primary font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3 h-3" /> Go Back
      </motion.button>
    </motion.div>
  );
}
