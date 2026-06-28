"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, Compass, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

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

const cardShakeVariants = {
  shake: {
    x: [0, -4, 4, -4, 4, -2, 2, 0],
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  idle: { x: 0 }
};

// Combined input variants (handles both staggered fade-in AND shake animations)
const inputFieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 25 }
  },
  shake: {
    x: [0, -6, 6, -6, 6, -3, 3, 0],
    transition: { duration: 0.35, ease: "easeInOut" }
  },
  idle: { x: 0 }
};

const arrowVariants = {
  initial: { x: 0, scale: 1 },
  hover: { x: 4, scale: 1.1, transition: { type: "spring" as const, stiffness: 400, damping: 12 } },
  tap: { x: 6, scale: 0.95 }
};

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

const submitButtonVariants = {
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
  
  // Custom states for focused keyboard alignment and password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [shakeField, setShakeField] = useState<"email" | "password" | "name" | "both" | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length >= 6;
  const isNameValid = name.trim().length > 0;

  // Auto-Focus transition: Focuses correct fields as user moves tabs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "register") {
        nameRef.current?.focus();
      } else {
        emailRef.current?.focus();
      }
    }, 120); // Sync with activeTab pill animation complete
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Handle shake triggers based on incoming error details
  useEffect(() => {
    if (errorMsg) {
      const lower = errorMsg.toLowerCase();
      if (lower.includes("email")) {
        setShakeField("email");
      } else if (lower.includes("password") || lower.includes("credential")) {
        setShakeField(activeTab === "password" ? "both" : "password");
      } else if (lower.includes("name")) {
        setShakeField("name");
      } else {
        setShakeField("both");
      }
      const timer = setTimeout(() => setShakeField(null), 500);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, activeTab]);

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
    if (!isEmailValid) {
      setShakeField("email");
      setTimeout(() => setShakeField(null), 500);
    }
    onSubmitQuick(email);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "quick") return;

    if (!isEmailValid) {
      setShakeField("email");
      setTimeout(() => setShakeField(null), 500);
    } else if (activeTab === "register" && !isNameValid) {
      setShakeField("name");
      setTimeout(() => setShakeField(null), 500);
    } else if (!isPasswordValid) {
      setShakeField("password");
      setTimeout(() => setShakeField(null), 500);
    }

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
      variants={cardShakeVariants as any}
      animate={borderState === "error" && shakeField === null ? "shake" : "idle"}
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

      {/* Forms Wrapper */}
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
              <motion.div 
                variants={inputFieldVariants as any}
                animate={shakeField === "email" || shakeField === "both" ? "shake" : "visible"}
                className="flex flex-col gap-2"
              >
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
                  ref={emailRef}
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 w-full"
                  required
                />
              </motion.div>

              <MagneticButton
                variants={submitButtonVariants}
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
              </MagneticButton>
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
                <motion.div 
                  variants={inputFieldVariants as any}
                  animate={shakeField === "name" ? "shake" : "visible"}
                  className="flex flex-col gap-2"
                >
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
                    ref={nameRef}
                    type="text"
                    placeholder="Your Name..."
                    value={name}
                    onChange={(e) => handleInputChange(setName, e.target.value)}
                    className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 w-full"
                    required={activeTab === "register"}
                  />
                </motion.div>
              )}

              <motion.div 
                variants={inputFieldVariants as any}
                animate={shakeField === "email" || shakeField === "both" ? "shake" : "visible"}
                className="flex flex-col gap-2"
              >
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
                  ref={emailRef}
                  type="email"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  className="px-4 py-2.5 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 w-full"
                  required
                />
              </motion.div>

              <motion.div 
                variants={inputFieldVariants as any}
                animate={shakeField === "password" || shakeField === "both" ? "shake" : "visible"}
                className="flex flex-col gap-2"
              >
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
                <div className="relative w-full">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handleInputChange(setPassword, e.target.value)}
                    className="px-4 py-2.5 pr-12 text-sm rounded-lg bg-input-bg text-primary placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-accent/8 focus:bg-card focus:shadow-[0_4px_20px_rgba(59,130,246,0.04)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 w-full"
                    required
                  />
                  {/* Eye Icon Reveal button with SVG Path length Draw Animation */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors p-1"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4.5 h-4.5"
                    >
                      {/* Outer Eye */}
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                      {/* Pupil */}
                      <circle cx="12" cy="12" r="3" />
                      {/* Slash drawing path */}
                      <motion.line
                        x1="3"
                        y1="3"
                        x2="21"
                        y2="21"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: showPassword ? 0 : 1 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>

              <MagneticButton
                variants={submitButtonVariants}
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
              </MagneticButton>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Warnings / Error Alerts */}
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
      <MagneticButton
        whileHover={{ scale: 1.012, y: -0.5 }}
        whileTap={{ scale: 0.988 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        type="button"
        onClick={onGuestAccess}
        disabled={actionLoading}
        shineColor="rgba(59, 130, 246, 0.08)"
        className="cursor-pointer w-full py-2.5 rounded-lg bg-card shadow-guest-btn text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Compass className="w-3.5 h-3.5 text-secondary animate-spin-slow" />
        Continue as Guest
      </MagneticButton>
    </motion.div>
  );
}
