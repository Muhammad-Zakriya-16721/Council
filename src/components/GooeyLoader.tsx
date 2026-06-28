"use client";

import { motion } from "framer-motion";

export default function GooeyLoader() {
  return (
    <div className="relative flex items-center justify-center w-20 h-10 select-none">
      {/* Hidden SVG Filter definition for gooey merging effect */}
      <svg className="absolute w-0 h-0" width="0" height="0">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Container applying the SVG gooey filter */}
      <div 
        className="flex items-center justify-center gap-4 relative w-full h-full"
        style={{ filter: "url(#gooey-filter)" }}
      >
        {/* Left Morphing Orb */}
        <motion.div
          animate={{
            x: [-12, 12, -12],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
          className="w-4 h-4 rounded-full bg-accent"
        />

        {/* Right Morphing Orb */}
        <motion.div
          animate={{
            x: [12, -12, 12],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut",
          }}
          className="w-4 h-4 rounded-full bg-accent"
        />

        {/* Central Pulse Anchor */}
        <motion.div
          animate={{
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.1,
            ease: "easeInOut",
          }}
          className="absolute w-3.5 h-3.5 rounded-full bg-accent/90"
        />
      </div>
    </div>
  );
}
