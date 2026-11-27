import * as React from "react"
import { cn } from "cn"
import { Send } from "lucide-react"
import { Button } from "../primitives/ui/button.tsx"

// The prompt composer. Before anything is sent, a person can see which route will handle
// it and what the agents are allowed to touch: `route` takes a ModelRoute, `tools` takes
// the scope summary, and tools start at none. It is a plain form, so it submits with no
// script and works as a Server Action target; the consumer owns `action` or `onSubmit`.
//
// Focus: the ring belongs to the whole composer, not the textarea inside it, so the
// outline is drawn on the form while the textarea has focus. The textarea's own outline is
// handed to the form, not removed.
type ComposerProps = React.ComponentProps<"form"> & {
  /** Accessible name for the text field. */
  label?: string
  placeholder?: string
  /** Field name in the submitted form data. */
  name?: string
  rows?: number
  route?: React.ReactNode
  tools?: React.ReactNode
  /** Accessible name for the send button. */
  sendLabel?: string
  disabled?: boolean
}

function Composer({
  label = "Message",
  placeholder = "Ask, or give the team a mission.",
  name = "prompt",
  rows = 2,
  route,
  tools,
  sendLabel = "Send",
  disabled = false,
  className,
  ...props
}: ComposerProps) {
  const id = React.useId()
  return (
    <form
      data-slot="composer"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-hairline bg-glass-opaque p-4 text-on-surface",
        "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-[3px] has-[textarea:focus-visible]:outline-focus",
        className
      )}
      {...props}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full resize-none bg-transparent text-body-md placeholder:text-on-surface/60 focus-visible:outline-0 disabled:opacity-50"
      />
      <div className="flex items-center justify-between gap-2">
        <div data-slot="composer-context" className="flex min-w-0 flex-wrap items-center gap-2">
          {route}
          {tools}
        </div>
        <Button type="submit" material="paper" size="icon" aria-label={sendLabel} disabled={disabled}>
          <Send aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}

export { Composer }
export type { ComposerProps }
