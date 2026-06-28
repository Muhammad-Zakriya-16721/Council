"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface OverlayState {
  x: number;
  y: number;
  newTheme: string;
  color: string;
  isActive: boolean;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [transitionOverlay, setTransitionOverlay] = useState<OverlayState | null>(null);

  // Motion values to animate the scale of the fluid clipPath
  const scaleValue = useMotionValue(0);
  const springScale = useSpring(scaleValue, { stiffness: 90, damping: 18 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme || "light";

  const handleThemeChange = (e: React.MouseEvent<HTMLButtonElement>, newTheme: string) => {
    if (newTheme === currentTheme || transitionOverlay) return;

    const x = e.clientX;
    const y = e.clientY;

    const themeBgColors: Record<string, string> = {
      light: "#ffffff",
      dark: "#000000",
      nord: "#020617",
    };

    const targetColor = themeBgColors[newTheme] || "#ffffff";

    // Initialize fluid organic shape reveal overlay
    setTransitionOverlay({
      x,
      y,
      newTheme,
      color: targetColor,
      isActive: true,
    });

    // Reset spring value and start the fluid expansion
    scaleValue.set(0);
    setTimeout(() => {
      scaleValue.set(28); // Expand to scale 28 (covers entire viewport)
    }, 50);

    // Switch underlying theme behind the cover once the screen is fully masked (550ms)
    setTimeout(() => {
      setTheme(newTheme);
    }, 550);

    // Transition overlay opacity to 0 (750ms)
    setTimeout(() => {
      setTransitionOverlay((prev) => (prev ? { ...prev, isActive: false } : null));
    }, 750);

    // Dismount overlay component (1050ms)
    setTimeout(() => {
      setTransitionOverlay(null);
      scaleValue.set(0);
    }, 1050);
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

      {/* Full-Screen Fluid Masking Portal Overlay */}
      <AnimatePresence>
        {transitionOverlay && (
          <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none">
            {/* SVG ClipPath with morphing liquid blob coordinates */}
            <svg className="absolute w-0 h-0" width="0" height="0">
              <defs>
                <clipPath id="theme-fluid-clip" clipPathUnits="userSpaceOnUse">
                  <motion.path
                    style={{
                      x: transitionOverlay.x,
                      y: transitionOverlay.y,
                      scale: springScale,
                    }}
                    animate={{
                      d: [
                        "M 0 -100 C 120 -120, 180 -50, 150 50 C 120 150, -50 180, -150 100 C -180 20, -120 -80, 0 -100",
                        "M 0 -100 C 70 -160, 170 -120, 120 50 C 70 220, -120 120, -120 100 C -120 20, -70 -40, 0 -100",
                        "M 0 -100 C 140 -80, 120 -20, 150 50 C 180 120, -50 120, -100 100 C -150 80, -120 -80, 0 -100",
                        "M 0 -100 C 120 -120, 180 -50, 150 50 C 120 150, -50 180, -150 100 C -180 20, -120 -80, 0 -100",
                      ],
                    }}
                    transition={{
                      d: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                    }}
                  />
                </clipPath>
              </defs>
            </svg>

            {/* Simulated Target Theme Container Wrapper */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: transitionOverlay.isActive ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full h-full relative ${transitionOverlay.newTheme}`}
            >
              {/* Inner screen overlay clipped by the morphing wobbly drop path */}
              <div 
                className="absolute inset-0 bg-background transition-colors duration-300"
                style={{ 
                  clipPath: "url(#theme-fluid-clip)",
                  WebkitClipPath: "url(#theme-fluid-clip)" 
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
