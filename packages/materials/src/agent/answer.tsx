import * as React from "react"
import { cn } from "cn"
import { Brain } from "lucide-react"
import { stateContract } from "../primitives/material.ts"

// An answer with its evidence attached. Three parts: the meta row (which route answered,
// what memory shaped it), the body with numbered citation marks, and the sources those
// marks point at. A mark and its source share an index and an anchor, so a claim is one
// keypress from its proof. A sentence with no mark is the model's own reasoning and reads
// as such.

function Answer({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="answer"
      className={cn("flex flex-col gap-4 rounded-lg border border-hairline bg-glass-opaque p-6 text-on-surface", className)}
      {...props}
    />
  )
}

function AnswerMeta({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="answer-meta" className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
}

function AnswerBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="answer-body" className={cn("max-w-[68ch] text-body-md text-pretty", className)} {...props} />
}

// The numbered mark inside the body. `sourcesId` is the id given to AnswerSources, so
// marks from two answers on one page never collide.
function CitationMark({ index, sourcesId, className, ...props }: Omit<React.ComponentProps<"a">, "href"> & { index: number; sourcesId: string }) {
  return (
    // The size sits on the sup and the colour on the link: cn() treats a custom size and a
    // colour on one element as the same group and keeps only the last.
    <sup className="font-mono text-code">
      <a
        data-slot="citation-mark"
        href={`#${sourcesId}-${index}`}
        aria-label={`Source ${index}`}
        className={cn(
          "rounded-xs px-0.5 text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus",
          className
        )}
        {...props}
      >
        [{index}]
      </a>
    </sup>
  )
}

function AnswerSources({ id, label = "Sources", className, ...props }: React.ComponentProps<"ol"> & { id: string; label?: string }) {
  return (
    <ol
      id={id}
      data-slot="answer-sources"
      aria-label={label}
      className={cn("flex list-none flex-wrap gap-2", className)}
      {...props}
    />
  )
}

type SourceChipProps = Omit<React.ComponentProps<"a">, "title"> & {
  index: number
  /** The id of the AnswerSources list this chip sits in. */
  sourcesId: string
  title: React.ReactNode
  /** Where it lives, for trust at a glance: "github.com". */
  domain?: React.ReactNode
}

// A source is always a link. It takes the state contract (press, focus ring, gated hover)
// because it is interactive; the list item around it carries the anchor a mark jumps to.
function SourceChip({ index, sourcesId, title, domain, className, ...props }: SourceChipProps) {
  return (
    <li id={`${sourcesId}-${index}`} className="scroll-mt-24">
      <a
        data-slot="source-chip"
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-md border border-hairline bg-primary px-3 py-2 text-on-surface fine-hover:border-highlight active:bg-glass-opaque",
          stateContract,
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="font-mono text-code text-accent-bright">
          {index}
        </span>
        <span className="text-label-md font-medium">{title}</span>
        {domain ? <span className="text-label-sm opacity-70">{domain}</span> : null}
      </a>
    </li>
  )
}

// Which model handled the work. A route, not an identity: people choose outcomes, the
// router chooses models, and the surface always says which one answered. `mark` takes a
// partner's official mark only; with none, an empty dashed slot holds the place rather
// than a redrawn logo.
type ModelRouteProps = React.ComponentProps<"span"> & {
  route: React.ReactNode
  detail?: React.ReactNode
  mark?: React.ReactNode
}

function ModelRoute({ route, detail, mark, className, ...props }: ModelRouteProps) {
  return (
    <span
      data-slot="model-route"
      className={cn("inline-flex items-center gap-2 rounded-full border border-hairline bg-primary px-3 py-1.5 text-on-surface", className)}
      {...props}
    >
      {mark ?? <span aria-hidden="true" data-slot="partner-mark-slot" className="size-4 shrink-0 rounded-full border border-dashed border-on-surface/40" />}
      <span className="text-label-md font-medium">{route}</span>
      {detail ? <span className="text-label-sm opacity-70">{detail}</span> : null}
    </span>
  )
}

// Says that stored memory shaped this answer. Static by default; wrap it in a link or a
// button to open the notes, where each can be edited or removed.
function MemoryChip({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="memory-chip"
      className={cn("inline-flex items-center gap-2 rounded-full border border-hairline bg-primary px-3 py-1.5 text-on-surface", className)}
      {...props}
    >
      <Brain aria-hidden="true" className="size-4 shrink-0 opacity-70" />
      <span className="text-label-sm">{children}</span>
    </span>
  )
}

export { Answer, AnswerBody, AnswerMeta, AnswerSources, CitationMark, MemoryChip, ModelRoute, SourceChip }
export type { ModelRouteProps, SourceChipProps }
