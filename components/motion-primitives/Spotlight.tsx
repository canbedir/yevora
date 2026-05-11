"use client";

import { type ReactNode, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  size?: number;
  from?: string;
  via?: string;
  to?: string;
}

export function Spotlight({
  children,
  className,
  size = 240,
  from = "rgba(245, 158, 11, 0.22)",
  via = "rgba(255, 255, 255, 0.16)",
  to = "transparent",
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-size);
  const y = useMotionValue(-size);
  const smoothX = useSpring(x, { stiffness: 160, damping: 22, mass: 0.2 });
  const smoothY = useSpring(y, { stiffness: 160, damping: 22, mass: 0.2 });
  const backgroundImage = useMotionTemplate`radial-gradient(${size}px circle at ${smoothX}px ${smoothY}px, ${from} 0%, ${via} 30%, ${to} 70%)`;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
  };

  const handleLeave = () => {
    x.set(-size);
    y.set(-size);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-[inherit]", className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundImage }}
      />
    </div>
  );
}
