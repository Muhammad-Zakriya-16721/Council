"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Shield, LogOut, Activity, Sparkles, AlertCircle } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  is_judge: boolean;
}

interface DashboardProps {
  user: User;
  profile: Profile | null;
  onSignOut: () => void;
  onSubmitJudge: (code: string) => void;
  actionLoading: boolean;
  judgeSuccess: boolean;
  errorMsg: string;
  borderState: "idle" | "error" | "warning" | "success";
}

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    opacity: 1,
    transition: { duration: 0.45, ease: "easeInOut" as const }
  },
  idle: { x: 0, opacity: 1 }
};

export default function Dashboard({
  user,
  profile,
  onSignOut,
  onSubmitJudge,
  actionLoading,
  judgeSuccess,
  errorMsg,
  borderState,
}: DashboardProps) {
  const [judgeCode, setJudgeCode] = useState("");

  const handleJudgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeCode) return;
    onSubmitJudge(judgeCode);
  };

  const getCardStyle = () => {
    if (judgeSuccess) return "shadow-[0_0_35px_rgba(16,185,129,0.2)]";
    if (borderState === "error") return "shadow-[0_0_35px_rgba(239,68,68,0.2)]";
    return "shadow-card";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="w-full max-w-4xl z-10 flex flex-col gap-6"
    >
      {/* Dashboard Header Bar */}
      <div className="flex justify-between items-center p-6 rounded-2xl bg-card shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Connected Session</span>
            <span className="text-sm font-semibold text-primary">
              {profile?.name || (user.is_anonymous ? "Guest Arena Spectator" : user.email)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {profile?.is_judge && (
            <span className="text-[9px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider shadow-guest-btn">
              Judge Enabled
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onSignOut}
            className="cursor-pointer p-2.5 rounded-full bg-card shadow-guest-btn text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.15 }}
          className="md:col-span-1 p-6 rounded-2xl bg-card shadow-card flex flex-col gap-5"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary border-b border-card-border opacity-50 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent animate-pulse" /> Status Monitor
          </h3>
          
          <div className="flex flex-col gap-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Connection:</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">User ID:</span>
              <span className="font-mono text-[10px] text-primary truncate max-w-[100px]" title={user.id}>
                {user.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Identity Type:</span>
              <span className="font-semibold text-primary">
                {user.is_anonymous ? "Spectator (Guest)" : "Verified User"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Role Status:</span>
              <span className="font-semibold text-primary">
                {profile?.is_judge ? "Lead Judge" : "Spectator"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Panel / Judge promotion */}
        <motion.div
          layout
          variants={shakeVariants as any}
          initial={{ opacity: 0, x: 20 }}
          animate={borderState === "error" ? "shake" : "idle"}
          transition={{
            layout: { type: "spring", stiffness: 350, damping: 28 },
            x: { type: "spring", stiffness: 300, damping: 24, delay: 0.25 },
            opacity: { duration: 0.3 }
          }}
          className={`md:col-span-2 p-6 rounded-2xl bg-card flex flex-col justify-between gap-6 transition-all duration-500 ${getCardStyle()}`}
        >
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary border-b border-card-border opacity-50 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Action Terminal
            </h3>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Access to the Debate Arena and Synthesizer workshops requires Judge Authorization. Enter your secret passcode in the console below to escalate your connection.
            </p>
          </div>

          {!profile?.is_judge ? (
            <form onSubmit={handleJudgeSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                  Judge Escalation Passcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Passcode..."
                    value={judgeCode}
                    onChange={(e) => setJudgeCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all duration-300"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.015, y: -0.5 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="submit"
                    disabled={actionLoading}
                    className="cursor-pointer px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-accent-btn text-accent-btn-text shadow-accent-btn hover:shadow-lg transition-all duration-300"
                  >
                    Verify
                  </motion.button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/5 text-emerald-500 text-xs font-medium leading-relaxed">
              Connection Elevated. You hold complete administrative access to design custom debate workshops and command the Lead Synthesizer.
            </div>
          )}

          {/* Inner card alerts with slide-down height animation */}
          <div className="relative">
            <AnimatePresence initial={false}>
              {judgeSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center shadow-guest-btn">
                    Access Granted. Judge privileges initialized.
                  </div>
                </motion.div>
              )}

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold text-center flex items-center gap-1.5 justify-center leading-relaxed shadow-guest-btn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
