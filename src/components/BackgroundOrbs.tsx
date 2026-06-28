"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function BackgroundOrbs() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Coordinates normalized around center of window (-0.5 to 0.5)
      mouseX.set((e.clientX / innerWidth) - 0.5);
      mouseY.set((e.clientY / innerHeight) - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Spring animations for a smooth, lag-free cursor lag response
  const orb1X = useSpring(useTransform(mouseX, (val) => val * -45), { stiffness: 55, damping: 28 });
  const orb1Y = useSpring(useTransform(mouseY, (val) => val * -45), { stiffness: 55, damping: 28 });

  const orb2X = useSpring(useTransform(mouseX, (val) => val * 35), { stiffness: 45, damping: 24 });
  const orb2Y = useSpring(useTransform(mouseY, (val) => val * 35), { stiffness: 45, damping: 24 });

  const orb3X = useSpring(useTransform(mouseX, (val) => val * -20), { stiffness: 65, damping: 32 });
  const orb3Y = useSpring(useTransform(mouseY, (val) => val * -20), { stiffness: 65, damping: 32 });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Orb 1: Primary floating accent sphere (top left focus) */}
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        animate={{
          y: [0, 15, -15, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[15%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_70%)] opacity-[0.06] dark:opacity-[0.09] blur-[80px]"
      />

      {/* Orb 2: Opposite balancing sphere (bottom right focus) */}
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        animate={{
          y: [0, -20, 20, 0],
          scale: [1, 0.96, 1.04, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 16,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[10%] right-[10%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_75%)] opacity-[0.05] dark:opacity-[0.07] blur-[90px]"
      />

      {/* Orb 3: Central pulsing ambient sphere */}
      <motion.div
        style={{ x: orb3X, y: orb3Y }}
        animate={{
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] left-[30%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_65%)] opacity-[0.03] dark:opacity-[0.05] blur-[70px]"
      />
    </div>
  );
}
