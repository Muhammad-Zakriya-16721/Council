"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, Compass, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

type TabType = "quick" | "password" | "register";
type BorderState = "idle" | "error" | "warning" | "success";

interface AuthCardProps {
  onSubmitQuick: (email: string) => void;
  onSubmitPassword: (tab: "password" | "register", email: string, password: string, name?: string) => void;
  onGuestAccess: () => void;
  onClearMessages?: () => void;
  actionLoading: boolean;
  errorMsg: string;
  infoMsg: string;
  borderState: BorderState;
}

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: "easeInOut" }
  },
  idle: { x: 0 }
};

const arrowVariants = {
  initial: { x: 0, scale: 1 },
  hover: { x: 4, scale: 1.1, transition: { type: "spring" as const, stiffness: 400, damping: 12 } },
  tap: { x: 6, scale: 0.95 }
};

// Form items staggered slide animation variants
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

const formItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 }
  }
};

export default function AuthCard({
  onSubmitQuick,
  onSubmitPassword,
  onGuestAccess,
  onClearMessages,
  actionLoading,
  errorMsg,
  infoMsg,
  borderState,
}: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("quick");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 6;
  const isNameValid = name.trim().length > 0;

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    if (onClearMessages) onClearMessages();
  };

  const handleInputChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    if (onClearMessages) onClearMessages();
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitQuick(email);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "quick") return;
    onSubmitPassword(activeTab, email, password, name);
  };

  const getCardStyle = () => {
    switch (borderState) {
      case "error":
        return "shadow-[0_0_40px_rgba(239,68,68,0.25)] dark:shadow-[0_0_50px_rgba(239,68,68,0.18)]";
      case "warning":
        return "shadow-[0_0_40px_rgba(245,158,11,0.25)] dark:shadow-[0_0_50px_rgba(245,158,11,0.18)]";
      case "success":
        return "shadow-[0_0_40px_rgba(16,185,129,0.25)] dark:shadow-[0_0_50px_rgba(16,185,129,0.18)]";
      default:
        return "shadow-card";
    }
  };

  return (
    <motion.div
      layout
      variants={shakeVariants as any}
      animate={borderState === "error" ? "shake" : "idle"}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`w-full max-w-md p-8 rounded-2xl bg-card backdrop-blur-xl transition-all duration-500 ${getCardStyle()}`}
    >
      {/* Tab Selector */}
      <div className="flex p-1 rounded-xl bg-input-bg relative z-10 mb-6">
        {(["quick", "password", "register"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabSwitch(tab)}
            className="cursor-pointer relative flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 z-10 flex items-center justify-center min-h-[32px]"
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-background rounded-lg shadow-guest-btn z-[-1]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`transition-colors duration-300 ${activeTab === tab ? "text-primary font-bold" : "text-gray-500 hover:text-primary"}`}>
              {tab === "quick" ? "Quick Access" : tab === "password" ? "Sign In" : "Register"}
            </span>
          </button>
        ))}
      </div>

      {/* Forms Wrapper (Autoresizes smoothly, borderless inputs with radial glow focus states) */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "quick" && (
            <motion.form
              key="quick-form"
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleQuickSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              <motion.div variants={formItemVariants} className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <motion.span
                    animate={{ 
                      color: isEmailValid ? "var(--color-accent)" : "var(--color-secondary)",
                      scale: isEmailValid ? [1, 1.25, 1] : 1
                    }}
                    transition={{
                      scale: { type: "tween", duration: 0.3, ease: "easeInOut" },
                      color: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                    className="flex items-center"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </motion.span>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300"
                  required
                />
              </motion.div>

              <motion.button
                variants={formItemVariants}
                whileHover="hover"
                whileTap="tap"
                initial="initial"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                type="submit"
                disabled={actionLoading}
                className="cursor-pointer w-full py-3 rounded-lg bg-accent-btn text-accent-btn-text font-bold text-xs uppercase tracking-widest shadow-accent-btn hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {actionLoading ? "Processing..." : "Access Council"}
                <motion.span variants={arrowVariants} className="flex items-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.span>
              </motion.button>
            </motion.form>
          )}

          {(activeTab === "password" || activeTab === "register") && (
            <motion.form
              key="password-form"
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handlePasswordSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              {activeTab === "register" && (
                <motion.div variants={formItemVariants} className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                    <motion.span
                      animate={{ 
                        color: isNameValid ? "var(--color-accent)" : "var(--color-secondary)",
                        scale: isNameValid ? [1, 1.25, 1] : 1
                      }}
                      transition={{
                        scale: { type: "tween", duration: 0.3, ease: "easeInOut" },
                        color: { type: "spring", stiffness: 300, damping: 15 }
                      }}
                      className="flex items-center"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                    </motion.span>
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name..."
                    value={name}
                    onChange={(e) => handleInputChange(setName, e.target.value)}
                    className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300"
                    required={activeTab === "register"}
                  />
                </motion.div>
              )}

              <motion.div variants={formItemVariants} className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <motion.span
                    animate={{ 
                      color: isEmailValid ? "var(--color-accent)" : "var(--color-secondary)",
                      scale: isEmailValid ? [1, 1.25, 1] : 1
                    }}
                    transition={{
                      scale: { type: "tween", duration: 0.3, ease: "easeInOut" },
                      color: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                    className="flex items-center"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </motion.span>
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300"
                  required
                />
              </motion.div>

              <motion.div variants={formItemVariants} className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <motion.span
                    animate={{ 
                      color: isPasswordValid ? "var(--color-accent)" : "var(--color-secondary)",
                      scale: isPasswordValid ? [1, 1.25, 1] : 1
                    }}
                    transition={{
                      scale: { type: "tween", duration: 0.3, ease: "easeInOut" },
                      color: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                    className="flex items-center"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </motion.span>
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleInputChange(setPassword, e.target.value)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300"
                  required
                />
              </motion.div>

              <motion.button
                variants={formItemVariants}
                whileHover="hover"
                whileTap="tap"
                initial="initial"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                type="submit"
                disabled={actionLoading}
                className="cursor-pointer w-full py-3 rounded-lg bg-accent-btn text-accent-btn-text font-bold text-xs uppercase tracking-widest shadow-accent-btn hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {actionLoading ? "Processing..." : activeTab === "register" ? "Create Account" : "Access Council"}
                <motion.span variants={arrowVariants} className="flex items-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.span>
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Warnings / Error Alerts with custom slide-down expansion inside card */}
      <div className="relative">
        <AnimatePresence initial={false}>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="p-3.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5 leading-relaxed shadow-[0_4px_15px_rgba(239,68,68,0.05)]">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            </motion.div>
          )}

          {infoMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-start gap-2.5 leading-relaxed shadow-[0_4px_15px_rgba(59,130,246,0.05)]">
                <CheckCircle className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-card-border opacity-30"></div>
        <span className="flex-shrink mx-4 text-[9px] text-gray-400 font-bold uppercase tracking-wider">OR</span>
        <div className="flex-grow border-t border-card-border opacity-30"></div>
      </div>

      {/* Guest Session Access */}
      <motion.button
        whileHover={{ scale: 1.012, y: -0.5 }}
        whileTap={{ scale: 0.988 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        type="button"
        onClick={onGuestAccess}
        disabled={actionLoading}
        className="cursor-pointer w-full py-2.5 rounded-lg bg-card shadow-guest-btn text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Compass className="w-3.5 h-3.5 text-secondary animate-spin-slow" />
        Continue as Guest
      </motion.button>
    </motion.div>
  );
}
