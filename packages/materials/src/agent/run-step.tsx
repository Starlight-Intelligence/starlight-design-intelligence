import * as React from "react"
import { cn } from "cn"
import { Check, Circle, LoaderCircle, ShieldAlert, X } from "lucide-react"
import { type RunState, runStateLabel } from "./run-state.ts"

// One step of an agent run: who did what, in which state, and how long it took. Every
// action an agent takes is a step, in order, so there is no hidden work. The surface is
// ink: a run reads as a log on the night shell, never on glass (glass carries controls,
// not records).
//
// The state names are the product run contract's (see run-state.ts). State is carried
// three ways at once: an icon, a tone, and the words from run-state.ts.
// The words are always in the DOM, so nothing depends on colour.

const stateIcon = {
  idle: Circle,
  working: LoaderCircle,
  waiting: ShieldAlert,
  done: Check,
  failed: X,
} satisfies Record<RunState, React.ComponentType<React.ComponentProps<"svg">>>

const stateTone: Record<RunState, string> = {
  idle: "text-on-surface/50",
  working: "text-signal",
  waiting: "text-accent-bright",
  done: "text-on-surface",
  failed: "text-error",
}

function RunTimeline({ className, label = "Run", ...props }: React.ComponentProps<"ol"> & { label?: string }) {
  return (
    <ol
      data-slot="run-timeline"
      aria-label={label}
      className={cn("flex list-none flex-col gap-2", className)}
      {...props}
    />
  )
}

type RunStepProps = Omit<React.ComponentProps<"li">, "title"> & {
  state: RunState
  /** What is being done, as a verb phrase: "Read the repository". */
  title: React.ReactNode
  /** Who is doing it and with what: "Research · 14 files". */
  detail?: React.ReactNode
  /** Duration or a short status of record. Falls back to the state label. */
  meta?: React.ReactNode
}

function RunStep({ state, title, detail, meta, className, ...props }: RunStepProps) {
  const Icon = stateIcon[state]
  return (
    <li
      data-slot="run-step"
      data-state={state}
      aria-current={state === "working" ? "step" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md border border-hairline bg-glass-opaque px-3 py-3 text-on-surface",
        state === "waiting" && "border-accent-bright/60",
        className
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={cn("size-4 shrink-0", stateTone[state])} />
      <div className="min-w-0 flex-1">
        <p className="text-label-md font-medium text-pretty">{title}</p>
        {detail ? <p className="mt-0.5 text-label-sm opacity-70">{detail}</p> : null}
      </div>
      {/* Not through cn(): it reads a custom size (text-code) and a colour (text-signal) as one
          conflicting group and drops the size. */}
      <p className={`shrink-0 font-mono text-code ${stateTone[state]}`}>
        {meta ? <span className="sr-only">{runStateLabel[state]}. </span> : null}
        {meta ?? runStateLabel[state]}
      </p>
    </li>
  )
}

export { RunStep, RunTimeline }
export type { RunStepProps }
