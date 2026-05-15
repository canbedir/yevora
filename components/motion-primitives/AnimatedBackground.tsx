"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";

import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  layoutId: string;
  className?: string;
  transition?: Transition;
}

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 30,
  mass: 0.38,
};

export function AnimatedBackground({
  layoutId,
  className,
  transition = defaultTransition,
}: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span aria-hidden="true" className={cn("absolute inset-0", className)} />;
  }

  return (
    <motion.span
      aria-hidden="true"
      layoutId={layoutId}
      transition={transition}
      className={cn("absolute inset-0", className)}
    />
  );
}
