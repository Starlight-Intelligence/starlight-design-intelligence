import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"
import { type Material, materialClasses } from "../material.ts"

// shadcn's card with a `material` prop. `interactive` opts a card into the state contract
// (press, focus ring, gated hover) and must be paired with `asChild` over a link or a
// button, so the card has keyboard activation and semantics; a bare interactive div is
// refused at the type level. A static card never gets a hover state, because a surface
// that reacts and does nothing is a lie. On paper a card rests on ivory, one tonal step
// above the page, and presses down to paper (DESIGN.md, Elevation & Depth).
type CardProps = React.ComponentProps<"div"> & { material?: Material } & (
  | { interactive?: false; asChild?: boolean }
  | { interactive: true; asChild: true }
)

function Card({ className, material = "paper", interactive = false, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="card"
      data-material={material}
      data-interactive={interactive ? "" : undefined}
      className={cn(
        "flex flex-col gap-6 rounded-lg py-6",
        materialClasses(material, interactive),
        material === "paper" && "bg-surface-ivory",
        material === "paper" && interactive && "active:bg-surface-paper fine-hover:bg-surface-paper",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-headline-md leading-tight font-semibold tracking-headline-md text-balance", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body-sm opacity-70", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
