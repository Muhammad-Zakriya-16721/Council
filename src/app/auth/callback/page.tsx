"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, AlertCircle } from "lucide-react";
import SuccessCard from "@/components/auth/SuccessCard";

export default function AuthCallback() {
  const [phase, setPhase] = useState<"verifying" | "confirmed" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        // Min 3-second delay to show the verified checkmark drawing animation
        const timerPromise = new Promise((resolve) => setTimeout(resolve, 3000));
        let exchangePromise = Promise.resolve();

        if (code) {
          exchangePromise = supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
            if (error) throw error;
            if (data?.user?.email) {
              setUserEmail(data.user.email);
            }
          });
        } else {
          // If no code in url, check if session is active
          exchangePromise = supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email) {
              setUserEmail(session.user.email);
            } else {
              throw new Error("No active authorization code or session found.");
            }
          });
        }

        // Wait for both code exchange AND the 3-second checkmark drawing animation to complete
        await Promise.all([exchangePromise, timerPromise]);

        // Elevate phase to Confirmed
        setPhase("confirmed");

        // Countdown 5 seconds to auto-close the tab (total 8 seconds)
        let count = 5;
        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count === 0) {
            clearInterval(interval);
            window.close();
          }
        }, 1000);

        return () => clearInterval(interval);
      } catch (err: any) {
        // Wait 2 seconds before showing error so the transition is smooth
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setPhase("error");
        setErrorMessage(err.message || "An unexpected callback error occurred.");
      }
    };

    handleCallback();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-text transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[50%] -translate-x-[50%] w-[1000px] h-[600px] rounded-full bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_60%)] opacity-5 dark:opacity-10 blur-3xl"></div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            {/* Show success checkmark draw right away while verifying session */}
            <SuccessCard 
              title="Confirming Connection"
              description="Validating secure token with Supabase..."
            />
          </motion.div>
        )}

        {phase === "confirmed" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Morph text to indicate verification completion */}
            <SuccessCard 
              title="Account Verified!"
              description="Your account has been verified, close this tab."
            />
            
            {/* Dynamic Progress Timer Ring */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-2 mt-2"
            >
              <div className="relative w-12 h-12 flex items-center justify-center select-none">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    className="text-gray-200 dark:text-gray-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  {/* Draining Circle */}
                  <motion.circle
                    className="text-emerald-500"
                    strokeWidth="3"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 100 }}
                    transition={{ duration: 5, ease: "linear" }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-primary">{countdown}s</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                Auto Closing Tab
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md p-8 rounded-2xl bg-card shadow-[0_0_40px_rgba(239,68,68,0.25)] text-center flex flex-col items-center gap-6"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle className="w-6 h-6 animate-bounce" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold text-primary">Authorization Failed</h1>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="w-full border-t border-card-border opacity-30 my-2"></div>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-gray-500" />
              Please try signing in again from the main tab.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
