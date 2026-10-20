"use client"

import * as React from "react"
import { cn } from "cn"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { type Material, materialClasses, stateContract } from "../material.ts"

// shadcn's sheet with a `material` prop. A side sheet is 100dvh, not h-full of a 100vh
// parent, so the phone URL bar never hides its footer; it pads the safe-area inset on the
// edge it touches, and it owns only its own scroll axis (touch-action: pan-y on a side
// sheet, pan-x on a top or bottom one). Entry and exit are opacity and transform only.

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-primary/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

type Side = "top" | "right" | "bottom" | "left"

const sideClasses: Record<Side, string> = {
  right:
    "inset-y-0 right-0 h-dvh w-3/4 rounded-l-xl touch-pan-y pr-[env(safe-area-inset-right)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
  left:
    "inset-y-0 left-0 h-dvh w-3/4 rounded-r-xl touch-pan-y pl-[env(safe-area-inset-left)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
  top:
    "inset-x-0 top-0 h-auto rounded-b-xl touch-pan-x pt-[env(safe-area-inset-top)] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom:
    "inset-x-0 bottom-0 h-auto rounded-t-xl touch-pan-x pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
}

function SheetContent({
  className,
  children,
  side = "right",
  material = "paper",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: Side
  material?: Material
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-material={material}
        className={cn(
          "fixed z-50 flex flex-col gap-4 transition ease-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          materialClasses(material, false),
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            className={cn(
              "absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full opacity-70 hover:opacity-100",
              stateContract
            )}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-headline-md font-semibold tracking-headline-md", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-body-sm opacity-70", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
