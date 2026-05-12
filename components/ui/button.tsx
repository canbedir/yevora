import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap text-[0.94rem] outline-none select-none transition-[background-color,border-color,color,box-shadow,opacity] duration-200 ease-out focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 active:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary/80 bg-primary text-primary-foreground shadow-sm hover:border-primary hover:bg-primary/90 hover:shadow-[0_0_0_3px_rgba(211,111,8,0.12)] active:bg-primary/85",
        outline:
          "border-neutral-200 bg-white text-neutral-800 shadow-sm hover:border-primary/40 hover:bg-orange-50 hover:text-neutral-950 hover:shadow-[0_0_0_3px_rgba(211,111,8,0.08)] aria-expanded:border-primary/40 aria-expanded:bg-orange-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border-neutral-200 bg-neutral-100 text-neutral-900 shadow-sm hover:border-neutral-300 hover:bg-neutral-200 hover:text-neutral-950 aria-expanded:bg-neutral-200",
        ghost:
          "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 dark:hover:bg-muted/50",
        destructive:
          "border-destructive/15 bg-destructive/10 text-destructive hover:border-destructive/30 hover:bg-destructive/15 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
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
