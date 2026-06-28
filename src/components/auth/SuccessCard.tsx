"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface SuccessCardProps {
  type?: "success" | "error";
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function SuccessCard({
  type = "success",
  title = "Access Verified",
  description = "Authentication successful. Entering Arena...",
  onAction,
  actionLabel = "Try Again",
}: SuccessCardProps) {
  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`w-full max-w-sm p-8 rounded-2xl bg-card flex flex-col items-center text-center gap-5 transition-all duration-500 ${
        isSuccess 
          ? "shadow-[0_0_40px_rgba(16,185,129,0.22)] dark:shadow-[0_0_50px_rgba(16,185,129,0.15)]" 
          : "shadow-[0_0_40px_rgba(239,68,68,0.22)] dark:shadow-[0_0_50px_rgba(239,68,68,0.15)]"
      }`}
    >
      {/* Dynamic Animated SVG Icon */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 select-none ${
        isSuccess ? "bg-emerald-500/10" : "bg-red-500/10"
      }`}>
        {isSuccess ? (
          <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              d="M20 6L9 17L4 12"
            />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              d="M18 6L6 18"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              d="M6 6l12 12"
            />
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className={`text-lg font-semibold ${isSuccess ? "text-primary" : "text-red-500"}`}>
          {title}
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
          {description}
        </p>
      </div>

      {!isSuccess && onAction && (
        <>
          <div className="w-full border-t border-card-border opacity-30 my-1"></div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAction}
            className="cursor-pointer text-[10px] text-gray-500 hover:text-primary font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" /> {actionLabel}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
