"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import {
  AgentPresence,
  ApprovalCard,
  DataTable,
  EvidenceDisclosure,
  GlassSurface,
  StarlightButton,
  TextField,
} from "@starlight/living-design";
import {
  parseArtifact,
  proposalSchema,
  type Artifact,
  type Comparison,
  type Decision,
  type MissionAgent,
  type Proposal,
  type Report,
  type ToolStep,
} from "./contracts.js";

export function AgentTranscript({
  messages,
  busy = false,
  disabled = false,
  onSubmit,
}: {
  messages: readonly {
    id: string;
    role: "user" | "assistant";
    content: string;
  }[];
  busy?: boolean;
  disabled?: boolean;
  onSubmit: (text: string) => Promise<void> | void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const pending = useRef(false);
  async function send() {
    if (pending.current || busy || disabled || !input.trim()) return;
    const submitted = input.trim();
    const draft = input;
    pending.current = true;
    setSending(true);
    setError("");
    try {
      await onSubmit(submitted);
      setInput((current) => (current === draft ? "" : current));
    } catch {
      setError("The request failed. Your draft is preserved; try again.");
    } finally {
      pending.current = false;
      setSending(false);
    }
  }
  return (
    <section className="sla-transcript" aria-label="Agent conversation">
      <div
        role="log"
        aria-label="Messages"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`sla-message sla-message--${message.role}`}
            >
              <strong>
                {message.role === "user" ? "You" : "Research agent"}
              </strong>
              <p>{message.content}</p>
            </div>
          ))
        ) : (
          <p>
            Ask for a comparison. Inspect and edit the result beside the
            conversation.
          </p>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <TextField
          label="Your request"
          value={input}
          maxLength={4000}
          onChange={(event) => setInput(event.target.value)}
          disabled={disabled}
          placeholder="Compare the two deployment options"
        />
        <StarlightButton
          type="submit"
          disabled={disabled || busy || sending || !input.trim()}
        >
          {busy || sending ? "Working…" : "Send request"}
        </StarlightButton>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export function ToolTimeline({ steps }: { steps: readonly ToolStep[] }) {
  return (
    <ol className="sla-timeline" aria-label="Tool execution">
      {steps.length ? (
        steps.map((step) => (
          <li key={step.id} data-state={step.status}>
            <span className="sla-timeline__marker" aria-hidden="true" />
            <div>
              <strong>{step.name}</strong>
              <span className="sla-state">{step.status}</span>
              <p>{step.detail}</p>
            </div>
          </li>
        ))
      ) : (
        <li>No tools have run.</li>
      )}
    </ol>
  );
}

/** Emits an exact-envelope decision once. Only the host may authorize/execute. */
export function BoundApproval({
  proposal,
  onDecision,
  now = () => Date.now(),
}: {
  proposal: Proposal;
  onDecision: (decision: Decision) => Promise<void>;
  now?: () => number;
}) {
  // A new envelope remounts the inner state. An old async resolution cannot approve a new revision.
  return (
    <ApprovalInstance
      key={JSON.stringify(proposal)}
      proposal={proposal}
      onDecision={onDecision}
      now={now}
    />
  );
}
function ApprovalInstance({
  proposal,
  onDecision,
  now,
}: {
  proposal: Proposal;
  onDecision: (decision: Decision) => Promise<void>;
  now: () => number;
}) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const claimed = useRef(false);
  const parsed = proposalSchema.safeParse(proposal);
  if (!parsed.success)
    return (
      <p role="alert">
        The action proposal is invalid. Request a new proposal.
      </p>
    );
  async function decide(decision: Decision["decision"]) {
    if (claimed.current) return;
    if (Date.parse(proposal.expiresAt) <= now()) {
      setError("This proposal expired. Request a new proposal.");
      return;
    }
    claimed.current = true;
    setBusy(true);
    setError("");
    try {
      await onDecision({ proposal: structuredClone(proposal), decision });
      setStatus(decision);
    } catch {
      setError(
        "The host did not acknowledge this decision. Check the run before requesting a new proposal.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sla-approval">
      <ApprovalCard
        action={proposal.tool}
        scope={proposal.scope}
        summary="Review the exact arguments. Approval requests a host decision; execution needs a separate receipt."
        status={status}
        disabled={busy || claimed.current}
        onDecision={(decision) => void decide(decision)}
        receiptLabel={`Run ${proposal.runId} · proposal ${proposal.id} · revision ${proposal.revision}`}
      />
      <EvidenceDisclosure summary="Exact action arguments">
        <pre>{JSON.stringify(proposal.arguments, null, 2)}</pre>
        <p>Expires {proposal.expiresAt}</p>
      </EvidenceDisclosure>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export function ComparisonArtifact({ artifact }: { artifact: Comparison }) {
  const [weight, setWeight] = useState(70);
  const inputId = useId();
  const rows = [...artifact.rows]
    .map((row) => ({
      ...row,
      score: Math.round(
        (row.quality * weight) / 100 +
          ((100 - row.cost) * (100 - weight)) / 100,
      ),
    }))
    .sort((a, b) => b.score - a.score);
  return (
    <section className="sla-artifact" aria-label="Interactive comparison">
      <h3>{artifact.title}</h3>
      <label htmlFor={inputId}>Quality weight: {weight}%</label>
      <input
        id={inputId}
        type="range"
        min="0"
        max="100"
        value={weight}
        onChange={(event) => setWeight(Number(event.target.value))}
      />
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        caption="Weighted deployment comparison"
        columns={[
          { key: "name", header: "Option", render: (row) => row.name },
          {
            key: "score",
            header: "Score / 100",
            render: (row) => (
              <>
                <meter
                  min="0"
                  max="100"
                  value={row.score}
                  aria-label={`${row.name} score ${row.score}`}
                />
                <span>{row.score}</span>
              </>
            ),
          },
          {
            key: "source",
            header: "Evidence",
            render: (row) => <span>{row.sourceId}</span>,
          },
        ]}
      />
      <p className="sla-note">
        Weighted illustrative scores. Editing priorities recalculates locally.
      </p>
      <Sources sources={artifact.sources} />
    </section>
  );
}
function Sources({ sources }: { sources: Report["sources"] }) {
  return (
    <EvidenceDisclosure summary={`Inspect ${sources.length} sources`}>
      <ol className="sla-sources">
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
            <code>{source.id}</code>
            <p>{source.excerpt}</p>
          </li>
        ))}
      </ol>
    </EvidenceDisclosure>
  );
}
export function ResearchReport({
  artifact,
  onExport,
}: {
  artifact: Report;
  onExport?: (report: Report) => void;
}) {
  return (
    <article className="sla-artifact">
      <h3>{artifact.title}</h3>
      <ol>
        {artifact.findings.map((finding, index) => (
          <li key={index}>
            {finding.text} <code>[{finding.sourceId}]</code>
          </li>
        ))}
      </ol>
      <Sources sources={artifact.sources} />
      {onExport && (
        <StarlightButton variant="secondary" onClick={() => onExport(artifact)}>
          Export cited report
        </StarlightButton>
      )}
    </article>
  );
}
export type ArtifactRegistry = {
  comparison: (value: Comparison) => ReactNode;
  report: (value: Report) => ReactNode;
};
export function ArtifactRenderer({
  input,
  registry,
}: {
  input: unknown;
  registry?: ArtifactRegistry;
}) {
  let artifact: Artifact;
  try {
    artifact = parseArtifact(input);
  } catch {
    return (
      <p role="alert">
        This artifact is unsupported or invalid. Ask the agent for a supported
        comparison or cited report.
      </p>
    );
  }
  return artifact.kind === "comparison" ? (
    registry ? (
      registry.comparison(artifact)
    ) : (
      <ComparisonArtifact artifact={artifact} />
    )
  ) : registry ? (
    registry.report(artifact)
  ) : (
    <ResearchReport artifact={artifact} />
  );
}
export function MissionRoster({ agents }: { agents: readonly MissionAgent[] }) {
  return (
    <div className="sla-roster">
      {agents.map((agent) => (
        <div key={agent.id}>
          <AgentPresence
            roleId={agent.id}
            name={agent.name}
            role={agent.role}
            status={agent.status}
          />
          <p>{agent.evidence}</p>
        </div>
      ))}
    </div>
  );
}
export function BrowserActivity({
  page,
  plan,
  receipt,
}: {
  page: { title: string; url: string; capturedAt: string };
  plan: readonly string[];
  receipt?: { id: string; result: string };
}) {
  const validUrl = /^https:\/\//i.test(page.url);
  return (
    <GlassSurface className="sla-browser">
      <h3>{page.title}</h3>
      <p className="sla-url">{validUrl ? page.url : "Page URL unavailable"}</p>
      <p className="sla-note">Page context captured {page.capturedAt}</p>
      <ol>
        {plan.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      {receipt ? (
        <p role="status">
          Receipt <code>{receipt.id}</code>: {receipt.result}
        </p>
      ) : (
        <p>
          No execution receipt. Review the proposed scope before any action.
        </p>
      )}
    </GlassSurface>
  );
}
