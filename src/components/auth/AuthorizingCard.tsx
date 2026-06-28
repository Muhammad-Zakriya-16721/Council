"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

interface AuthorizingCardProps {
  email: string;
  infoMsg: string;
  onCancel?: () => void;
  borderState?: "idle" | "error" | "warning" | "success";
}

export default function AuthorizingCard({
  email,
  infoMsg,
  borderState = "idle",
}: AuthorizingCardProps) {
  
  const getCardStyle = () => {
    switch (borderState) {
      case "error":
        return "shadow-[0_0_40px_rgba(239,68,68,0.25)]";
      case "success":
        return "shadow-[0_0_40px_rgba(16,185,129,0.25)]";
      case "warning":
        return "shadow-[0_0_40px_rgba(245,158,11,0.25)]";
      default:
        return "shadow-[0_0_40px_rgba(59,130,246,0.25)]"; 
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`w-full max-w-md p-8 rounded-2xl bg-card flex flex-col items-center text-center gap-6 relative transition-all duration-500 ${getCardStyle()}`}
    >
      {/* Pulse Status */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
        <span className="text-[9px] font-bold tracking-widest text-accent uppercase">
          Verifying Credentials
        </span>
      </div>

      {/* Network Concentric Wave Animation */}
      <div className="relative flex items-center justify-center w-16 h-16 my-2 select-none">
        <motion.div
          animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-accent/20"
        />
        <motion.div
          animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-accent/15"
        />
        <div className="relative w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <ShieldCheck className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary">Validating Secure Token</h2>
        <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
          Exchanging secure authorization codes with Supabase. Please keep this tab open while we establish your session.
        </p>
      </div>

      {infoMsg && (
        <div className="p-3.5 rounded-xl bg-accent/5 text-accent text-xs font-semibold text-center flex items-center gap-2.5 justify-center leading-relaxed shadow-guest-btn w-full">
          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
          <span>{infoMsg}</span>
        </div>
      )}
    </motion.div>
  );
}
