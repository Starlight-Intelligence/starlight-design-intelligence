import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"
import { type Material, materialClasses } from "../material.ts"

// shadcn's button with one change: `material` replaces `variant` as the surface, and the
// state contract (press, focus ring, gated hover) comes from material.ts rather than from a
// per-variant hover class. Sizes keep shadcn's names; the default is the 44px pill from
// DESIGN.md so a thumb lands on it.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-label-md font-medium whitespace-nowrap aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-6 text-body-md has-[>svg]:px-5",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Button({
  className,
  material = "ink",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    material?: Material
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-material={material}
      data-size={size}
      className={cn(buttonVariants({ size }), materialClasses(material, true), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
