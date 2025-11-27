import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
                destructive:
                    "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                // Color variants
                red: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 [a&]:hover:bg-red-200 dark:[a&]:hover:bg-red-900",
                green: "border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 [a&]:hover:bg-green-200 dark:[a&]:hover:bg-green-900",
                blue: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 [a&]:hover:bg-blue-200 dark:[a&]:hover:bg-blue-900",
                yellow: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [a&]:hover:bg-yellow-200 dark:[a&]:hover:bg-yellow-900",
                purple: "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 [a&]:hover:bg-purple-200 dark:[a&]:hover:bg-purple-900",
                orange: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 [a&]:hover:bg-orange-200 dark:[a&]:hover:bg-orange-900",
                pink: "border-transparent bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 [a&]:hover:bg-pink-200 dark:[a&]:hover:bg-pink-900",
                indigo: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 [a&]:hover:bg-indigo-200 dark:[a&]:hover:bg-indigo-900",
                teal: "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 [a&]:hover:bg-teal-200 dark:[a&]:hover:bg-teal-900",
                gray: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 [a&]:hover:bg-gray-200 dark:[a&]:hover:bg-gray-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
