"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import GooeyLoader from "@/components/GooeyLoader";

interface VerificationCardProps {
  email: string;
  onCancel: () => void;
  isVerified?: boolean;
}

export default function VerificationCard({ email, onCancel, isVerified = false }: VerificationCardProps) {
  const [logFeed, setLogFeed] = useState<string[]>([
    "Initializing secure local handshake...",
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of terminal log feed when a new message is added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logFeed]);

  // Micro-Terminal Ticker logs
  useEffect(() => {
    if (isVerified) return;

    const messages = [
      "Establishing DB tunnel connection...",
      "Matching device registration footprint...",
      "Supabase real-time port online.",
      "Awaiting confirmation token validation...",
      "TLS connection verified.",
      "Monitoring remote login event...",
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length) {
        setLogFeed((prev) => [...prev, messages[messageIndex]].slice(-3));
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isVerified]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        boxShadow: isVerified 
          ? "0 0 45px rgba(16,185,129,0.2)" 
          : "0 10px 30px rgba(0,0,0,0.04)"
      }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`w-full max-w-md p-8 rounded-2xl bg-card shadow-card flex flex-col items-center text-center gap-6 relative overflow-hidden transition-all duration-500`}
    >
      {/* Sweeping verification scanning light */}
      {!isVerified && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: ["-10%", "110%"] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-1.5 bg-[linear-gradient(to_right,transparent,var(--color-accent),transparent)] opacity-25 blur-[1.5px]"
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isVerified ? (
          <motion.div
            key="verifying-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            {/* Pulsing Envelope Verification Waves */}
            <div className="relative flex items-center justify-center w-16 h-16 my-1 select-none">
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

            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-semibold text-primary">Verify Your Email</h2>
              <p className="text-xs text-gray-500 max-w-[290px] mx-auto leading-relaxed">
                A magic link has been sent, kindly verify. Click the link in your email to authenticate this browser and access the Council.
              </p>
            </div>

            {/* Liquid Gooey Loader */}
            <div className="flex flex-col items-center gap-1">
              <GooeyLoader />
            </div>

            {/* Micro-Terminal Ticker logs */}
            <div 
              ref={logContainerRef}
              className="w-full p-3 rounded-lg bg-black/[0.02] dark:bg-black/25 font-mono text-[9px] text-left text-gray-400 dark:text-gray-500 flex flex-col gap-1 max-h-[85px] overflow-y-auto select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] border-t border-card-border/5 scrollbar-thin"
            >
              {logFeed.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="truncate"
                >
                  <span className="text-accent mr-1 font-bold">&gt;</span> {log}
                </motion.div>
              ))}
            </div>

            <div className="w-full border-t border-card-border opacity-30 my-1"></div>

            {/* Cancel Action */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="cursor-pointer text-[10px] text-gray-500 hover:text-primary font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" /> Go Back
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center gap-5 w-full py-4"
          >
            {/* Success checkmark draw */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1 select-none">
              <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  d="M20 6L9 17L4 12"
                />
              </svg>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-emerald-500">Access Granted!</h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                Authentication verified. Entering Council...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
