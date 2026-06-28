"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, HTMLMotionProps } from "framer-motion";

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  shineColor?: string;
}

export default function MagneticButton({
  children,
  className = "",
  shineColor = "rgba(255, 255, 255, 0.15)",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for translation
  const springX = useSpring(x, { stiffness: 180, damping: 15 });
  const springY = useSpring(y, { stiffness: 180, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Magnetic pull coordinates (shifts button center slightly toward cursor - reduced by 40% for sublte response)
    const pullX = (clientX - (left + width / 2)) * 0.17;
    const pullY = (clientY - (top + height / 2)) * 0.17;

    x.set(pullX);
    y.set(pullY);

    // Radial gradient shine coordinates relative to button
    setCoords({
      x: clientX - left,
      y: clientY - top,
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    // Call the parent onMouseLeave if passed
    if (props.onMouseLeave) props.onMouseLeave(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    // Call the parent onMouseEnter if passed
    if (props.onMouseEnter) props.onMouseEnter(e);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group overflow-hidden ${className}`}
      {...(props as any)}
    >
      {/* Radial Gradient Glow overlay tracker */}
      <span 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(80px circle at ${coords.x}px ${coords.y}px, ${shineColor}, transparent)`,
        }}
      />
      {children}
    </motion.button>
  );
}
