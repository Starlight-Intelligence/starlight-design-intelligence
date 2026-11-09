import * as React from "react";
import { cn } from "cn";
import { StatusBadge, type StatusType } from "./status-badge.tsx";

export interface AgentPresenceProps extends React.HTMLAttributes<HTMLDivElement> {
  roleId: string;
  name: string;
  role: string;
  status?: StatusType;
  description?: string;
  tier?: string;
}

export function AgentPresence({
  roleId,
  name,
  role,
  status = "unknown",
  description,
  tier,
  className,
  ...props
}: AgentPresenceProps) {
  return (
    <div
      data-slot="agent-presence"
      className={cn(
        "flex items-start gap-3.5 p-4 rounded-xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-surface-1,#0d1119)] text-[var(--sl-fg,#ede6d8)]",
        className
      )}
      {...props}
    >
      <div
        className="relative grid place-items-center w-12 h-12 shrink-0 rounded-2xl border border-[var(--sl-border,rgba(237,230,216,0.12))] bg-[var(--sl-bg,#070a10)] overflow-hidden"
        aria-hidden="true"
      >
        <span className="w-6 h-6 rounded-full border border-[var(--sl-companion,#82d8e6)] -rotate-32 shadow-[inset_5px_0_0_rgba(130,216,230,0.2)]" />
        <i className="absolute w-7 h-3 rounded-full border border-[var(--sl-fg-muted,#8b93a1)] -rotate-32" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <strong className="text-sm font-semibold tracking-tight text-[var(--sl-fg,#ede6d8)]">
              {name}
            </strong>
            {tier && (
              <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-[var(--sl-border,rgba(237,230,216,0.12))] text-[var(--sl-fg-muted,#8b93a1)]">
                {tier}
              </span>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <span className="block mt-1 text-xs text-[var(--sl-fg-muted,#8b93a1)] font-sans">
          {role}
        </span>
        <code className="block mt-1 text-[11px] font-mono text-[var(--sl-fg-muted,#8b93a1)] opacity-75 break-all">
          {roleId}
        </code>

        {description && (
          <p className="mt-2 text-xs leading-relaxed text-[var(--sl-fg-muted,#8b93a1)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
