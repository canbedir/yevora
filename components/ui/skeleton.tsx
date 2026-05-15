import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-[linear-gradient(180deg,rgba(240,239,235,0.96),rgba(233,231,226,0.92))] before:absolute before:inset-0 before:-translate-x-full before:animate-[yev-skeleton-shimmer_1.5s_ease-in-out_infinite] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
