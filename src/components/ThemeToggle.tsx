"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme || "light";

  return (
    <div className="flex p-1 rounded-full bg-input-bg shadow-guest-btn relative z-50 select-none">
      {['light', 'dark', 'nord'].map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className="cursor-pointer relative px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 z-10 flex items-center justify-center min-h-[28px] min-w-[70px]"
        >
          {currentTheme === t && (
            <motion.div
              layoutId="activeThemePill"
              className="absolute inset-0 bg-card shadow-guest-btn rounded-full z-[-1]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className={`transition-colors duration-300 ${currentTheme === t ? "text-primary" : "text-gray-500 hover:text-primary"}`}>
            {t}
          </span>
        </button>
      ))}
    </div>
  );
}
