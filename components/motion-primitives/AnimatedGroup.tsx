"use client";

import { Children, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

type Preset = "fade" | "slide" | "scale" | "blur-slide";

interface AnimatedGroupProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  preset?: Preset;
  delay?: number;
  stagger?: number;
}

const itemVariants: Record<Preset, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  },
  slide: {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
  "blur-slide": {
    hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  itemClassName,
  preset = "blur-slide",
  delay = 0,
  stagger = 0.08,
}: AnimatedGroupProps) {
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants[preset]} className={cn(itemClassName)}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
