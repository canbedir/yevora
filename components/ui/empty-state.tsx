import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-5 text-center",
        compact ? "py-10" : "py-12",
        className
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "flex items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600",
            compact ? "h-10 w-10" : "h-11 w-11"
          )}
        >
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </span>
      ) : null}
      <p className={cn("text-sm font-semibold text-neutral-950", Icon && "mt-4")}>{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-neutral-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
