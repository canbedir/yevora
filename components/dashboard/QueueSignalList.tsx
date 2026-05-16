"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CircleDot,
  ExternalLink,
  FileText,
  GitPullRequest,
  Timer,
} from "lucide-react";

import { AnimatedBackground } from "@/components/motion-primitives/AnimatedBackground";

type QueueTone = "focus" | "github" | "notes" | "repo";

export interface QueueSignalItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: QueueTone;
  external?: boolean;
}

const toneStyles: Record<QueueTone, string> = {
  focus: "bg-orange-100 text-orange-700",
  github: "bg-sky-100 text-sky-700",
  notes: "bg-emerald-100 text-emerald-700",
  repo: "bg-neutral-100 text-neutral-700",
};

interface QueueSignalListProps {
  items: QueueSignalItem[];
  variant: "today" | "notification";
  onItemSelect?: () => void;
}

export function QueueSignalList({ items, variant, onItemSelect }: QueueSignalListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const layoutId = variant === "today" ? "today-queue-hover" : "notification-queue-hover";

  return (
    <div
      className={variant === "today" ? "space-y-0.5" : "space-y-0.5"}
      onMouseLeave={() => setHoveredId(null)}
    >
      {items.map((item) => {
        const isHighlighted = hoveredId === item.id;
        const iconClassName = variant === "today" ? "h-9 w-9 rounded-md" : "h-8 w-8 rounded-md";
        const rowClassName =
          variant === "today"
            ? "relative isolate flex items-start gap-3 overflow-hidden rounded-xl px-5 py-4 outline-none"
            : "relative isolate flex items-start gap-3 overflow-hidden rounded-md px-2.5 py-2.5 outline-none";
        const highlightClassName =
          variant === "today"
            ? "inset-x-2 inset-y-1 rounded-lg border border-neutral-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,250,249,0.94))] shadow-[0_14px_30px_-26px_rgba(15,23,42,0.34)]"
            : "inset-x-1 inset-y-0.5 rounded-md border border-neutral-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,250,249,0.94))] shadow-[0_14px_28px_-26px_rgba(15,23,42,0.32)]";

        const content = (
          <>
            {isHighlighted ? (
              <AnimatedBackground layoutId={layoutId} className={highlightClassName} />
            ) : null}

            <motion.span
              className={`relative z-10 mt-0.5 flex shrink-0 items-center justify-center ${iconClassName} ${toneStyles[item.tone]}`}
              animate={!prefersReducedMotion && isHighlighted ? { scale: 1.04, y: -1 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <ToneIcon tone={item.tone} />
            </motion.span>
            <span className="relative z-10 min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-950">{item.title}</span>
              <span
                className={
                  variant === "today"
                    ? "mt-1 block text-sm leading-6 text-neutral-600"
                    : "mt-0.5 line-clamp-2 block text-xs leading-5 text-neutral-500"
                }
              >
                {item.detail}
              </span>
            </span>
            <motion.span
              className="relative z-10 mt-1 shrink-0 text-neutral-400"
              animate={!prefersReducedMotion && isHighlighted ? { x: 2, opacity: 1 } : { x: 0, opacity: 0.8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {item.external ? (
                <ExternalLink className="h-4 w-4" />
              ) : variant === "today" ? (
                <ArrowRight className="h-4 w-4" />
              ) : null}
            </motion.span>
          </>
        );

        const sharedProps = {
          onMouseEnter: () => setHoveredId(item.id),
          onFocus: () => setHoveredId(item.id),
          onBlur: () => setHoveredId((currentValue) => (currentValue === item.id ? null : currentValue)),
          onClick: () => onItemSelect?.(),
          className: rowClassName,
        };

        if (item.external) {
          return (
            <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
              {content}
            </a>
          );
        }

        return (
          <Link key={item.id} href={item.href} {...sharedProps}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function ToneIcon({ tone }: { tone: QueueTone }) {
  if (tone === "focus") return <Timer className="h-4 w-4" />;
  if (tone === "github") return <GitPullRequest className="h-4 w-4" />;
  if (tone === "notes") return <FileText className="h-4 w-4" />;
  return <CircleDot className="h-4 w-4" />;
}
