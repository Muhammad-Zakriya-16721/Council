"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OverlayState {
  x: number;
  y: number;
  color: string;
  isActive: boolean;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState<OverlayState | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme || "light";

  const handleThemeChange = (e: React.MouseEvent<HTMLButtonElement>, newTheme: string) => {
    if (newTheme === currentTheme || transitionOverlay) return;

    const x = e.clientX;
    const y = e.clientY;

    // Direct background colors mapping matching globals.css theme definitions
    const themeBgColors: Record<string, string> = {
      light: "#ffffff",
      dark: "#000000",
      nord: "#020617",
    };

    const targetColor = themeBgColors[newTheme] || "#ffffff";

    // 1. Initialize liquid overlay splash centered at click position
    setTransitionOverlay({
      x,
      y,
      color: targetColor,
      isActive: true,
    });

    // 2. Switch theme behind the cover once blobs merge and fill the viewport (450ms)
    setTimeout(() => {
      setTheme(newTheme);
    }, 450);

    // 3. Initiate fade out of the splash overlay (700ms)
    setTimeout(() => {
      setTransitionOverlay((prev) => (prev ? { ...prev, isActive: false } : null));
    }, 700);

    // 4. Dismount transition portal (1000ms)
    setTimeout(() => {
      setTransitionOverlay(null);
    }, 1000);
  };

  return (
    <>
      <div className="flex p-1 rounded-full bg-input-bg shadow-guest-btn relative z-50 select-none">
        {['light', 'dark', 'nord'].map((t) => (
          <button
            key={t}
            onClick={(e) => handleThemeChange(e, t)}
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

      {/* Floating Fluid Liquid Theme transition Overlay */}
      <AnimatePresence>
        {transitionOverlay && (
          <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none">
            {/* Liquid gooey SVG filter */}
            <svg className="absolute w-0 h-0" width="0" height="0">
              <defs>
                <filter id="theme-gooey-filter">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
                  <feColorMatrix 
                    in="blur" 
                    mode="matrix" 
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -14" 
                    result="goo" 
                  />
                  <feBlend in="SourceGraphic" in2="goo" />
                </filter>
              </defs>
            </svg>

            {/* Gooey container */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: transitionOverlay.isActive ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative"
              style={{ filter: "url(#theme-gooey-filter)" }}
            >
              {/* Orb 1: Primary expander */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 3.2 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="absolute rounded-full"
                style={{
                  left: transitionOverlay.x,
                  top: transitionOverlay.y,
                  width: "100vmax",
                  height: "100vmax",
                  marginLeft: "-50vmax",
                  marginTop: "-50vmax",
                  backgroundColor: transitionOverlay.color,
                }}
              />

              {/* Orb 2: Fluid splash left offset */}
              <motion.div
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 2.8, x: -140, y: -60 }}
                transition={{ duration: 0.7, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="absolute rounded-full opacity-90"
                style={{
                  left: transitionOverlay.x,
                  top: transitionOverlay.y,
                  width: "80vmax",
                  height: "80vmax",
                  marginLeft: "-40vmax",
                  marginTop: "-40vmax",
                  backgroundColor: transitionOverlay.color,
                }}
              />

              {/* Orb 3: Fluid splash right offset */}
              <motion.div
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 2.8, x: 140, y: 60 }}
                transition={{ duration: 0.7, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="absolute rounded-full opacity-90"
                style={{
                  left: transitionOverlay.x,
                  top: transitionOverlay.y,
                  width: "85vmax",
                  height: "85vmax",
                  marginLeft: "-42.5vmax",
                  marginTop: "-42.5vmax",
                  backgroundColor: transitionOverlay.color,
                }}
              />

              {/* Orb 4: Fluid splash top offset */}
              <motion.div
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 2.5, x: 40, y: -160 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute rounded-full opacity-80"
                style={{
                  left: transitionOverlay.x,
                  top: transitionOverlay.y,
                  width: "70vmax",
                  height: "70vmax",
                  marginLeft: "-35vmax",
                  marginTop: "-35vmax",
                  backgroundColor: transitionOverlay.color,
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
