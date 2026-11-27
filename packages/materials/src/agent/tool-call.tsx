import * as React from "react"
import { cn } from "cn"
import { ShieldCheck, Terminal } from "lucide-react"

// A tool invocation shown as it was made: the tool's name, its exact arguments, and the
// scope it ran under. Nothing is summarised away; a person can copy the arguments and
// check them.
type ToolCallProps = React.ComponentProps<"section"> & {
  /** The tool as the agent called it: "github.read_files". */
  name: string
  /** The scope the call ran under: "read-only". */
  scope?: React.ReactNode
  /** The arguments, verbatim. Rendered in a scrollable pre; never truncated. */
  args?: string
  /** How long the grant lasts or what it covers: "Scope granted for this run only." */
  note?: React.ReactNode
}

function ToolCall({ name, scope, args, note, className, ...props }: ToolCallProps) {
  return (
    <section
      data-slot="tool-call"
      aria-label={`Tool call: ${name}`}
      className={cn("flex flex-col gap-3 rounded-lg border border-hairline bg-primary p-4 text-on-surface", className)}
      {...props}
    >
      <header className="flex items-center gap-2">
        <Terminal aria-hidden="true" className="size-4 shrink-0 opacity-70" />
        <code className="min-w-0 flex-1 truncate font-mono text-code">{name}</code>
        {scope ? <span className="shrink-0 text-label-sm opacity-70">{scope}</span> : null}
      </header>
      {args ? (
        <pre className="overflow-x-auto rounded-md bg-glass-opaque p-3 font-mono text-code opacity-80">
          <code>{args}</code>
        </pre>
      ) : null}
      {note ? <p className="text-label-sm opacity-70">{note}</p> : null}
    </section>
  )
}

// The gate a run stops at while a step is waiting on a person. Which actions need a gate
// is the product run contract's decision, not this component's. It
// states the actor, the action and the scope, then waits. The actions are children so the
// consumer owns the handlers; pass Buttons, the first one being the approval. Approval
// applies to this action only, and the note says what has not happened yet.
type ApprovalGateProps = Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode
  /** Actor, action and object in one sentence: "Build wants to open a pull request with 3 changed files." */
  request: React.ReactNode
  /** The exact scope being asked for: "repo.write · example-org/logger". */
  scope?: React.ReactNode
  /** What is true until a choice is made: "Nothing is written until you choose." */
  note?: React.ReactNode
}

function ApprovalGate({ title = "Approval needed", request, scope, note, children, className, ...props }: ApprovalGateProps) {
  const id = React.useId()
  return (
    <section
      data-slot="approval-gate"
      role="group"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-request`}
      className={cn("flex flex-col gap-3 rounded-lg border border-accent-bright/60 bg-primary p-4 text-on-surface", className)}
      {...props}
    >
      <header className="flex items-center gap-2">
        <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-accent-bright" />
        <h3 id={`${id}-title`} className="text-label-md font-medium">
          {title}
        </h3>
      </header>
      <p id={`${id}-request`} className="text-body-md text-pretty">
        {request}
      </p>
      {scope ? <p className="font-mono text-code opacity-70">{scope}</p> : null}
      <div data-slot="approval-actions" className="flex flex-wrap gap-2">
        {children}
      </div>
      {note ? <p className="text-label-sm opacity-70">{note}</p> : null}
    </section>
  )
}

export { ApprovalGate, ToolCall }
export type { ApprovalGateProps, ToolCallProps }
