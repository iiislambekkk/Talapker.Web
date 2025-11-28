import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const buttonVariants = cva(
    "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
      variants: {
        variant: {
          default: "border border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40",
          destructive:
              "border border-transparent bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
          outline:
              "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/90",
          secondary:
              "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ghost:
              "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
          link: "text-primary underline-offset-4 hover:underline",

          // Color variants matching badge styles
          red: "border border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40",
          green: "border border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40",
          blue: "border border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40",
          yellow: "border border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900 focus-visible:ring-yellow-500/20 dark:focus-visible:ring-yellow-500/40",
          purple: "border border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 focus-visible:ring-purple-500/20 dark:focus-visible:ring-purple-500/40",
          orange: "border border-transparent bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900 focus-visible:ring-orange-500/20 dark:focus-visible:ring-orange-500/40",
          pink: "border border-transparent bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900 focus-visible:ring-pink-500/20 dark:focus-visible:ring-pink-500/40",
          indigo: "border border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 focus-visible:ring-indigo-500/20 dark:focus-visible:ring-indigo-500/40",
          teal: "border border-transparent bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900 focus-visible:ring-teal-500/20 dark:focus-visible:ring-teal-500/40",
          gray: "border border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-500/20 dark:focus-visible:ring-gray-500/40",
        },
        size: {
          default: "h-9 px-4 py-2 has-[>svg]:px-3",
          sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
          lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
          icon: "size-9",
          "icon-sm": "size-8",
          "icon-lg": "size-10",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

    if (!variant || variant === "default") {
        variant = "indigo"
    }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
