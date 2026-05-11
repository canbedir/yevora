import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap text-[0.94rem] transform-gpu will-change-transform transition-[background-color,border-color,color,box-shadow,opacity,filter,transform] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 hover:-translate-y-[1px] hover:scale-[1.01] active:not-aria-[haspopup]:translate-y-0 active:not-aria-[haspopup]:scale-[0.985] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,255,255,0.14)_38%,rgba(255,229,193,0.12)_58%,rgba(255,255,255,0.04))] before:opacity-0 before:transition-[opacity,transform] before:duration-350 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:scale-[0.985] after:pointer-events-none after:absolute after:inset-y-[-18%] after:left-[-36%] after:w-[42%] after:skew-x-[-18deg] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.62),transparent)] after:opacity-0 after:transition-[transform,opacity] after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-100 hover:before:opacity-100 hover:after:translate-x-[318%] hover:after:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-350 [&_svg:not([class*='size-'])]:size-4 group-hover/button:[&_svg]:translate-x-0.5",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(191,101,16,0.54)] bg-[linear-gradient(135deg,#f5a623_0%,#eb8d16_45%,#d36f08_100%)] text-primary-foreground shadow-[0_14px_34px_-18px_rgba(211,111,8,0.58),inset_0_1px_0_rgba(255,255,255,0.26)] hover:border-[rgba(168,87,11,0.72)] hover:brightness-[1.03] hover:shadow-[0_24px_52px_-22px_rgba(211,111,8,0.62),inset_0_1px_0_rgba(255,255,255,0.34)]",
        outline:
          "border-[rgba(217,178,120,0.34)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,249,241,0.92))] text-foreground shadow-[0_12px_28px_-22px_rgba(15,23,42,0.2),inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-[rgba(214,124,26,0.34)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,245,230,0.96))] hover:text-foreground hover:shadow-[0_20px_42px_-26px_rgba(198,112,27,0.28),inset_0_1px_0_rgba(255,255,255,0.84)] aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border border-white/60 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(245,238,228,0.96))] text-secondary-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.22)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,242,230,0.98))] hover:shadow-[0_18px_38px_-24px_rgba(15,23,42,0.24)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-muted-foreground hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,247,235,0.9))] hover:text-foreground hover:shadow-[0_16px_32px_-24px_rgba(191,101,16,0.24)] aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
