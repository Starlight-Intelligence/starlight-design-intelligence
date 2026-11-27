import {
  HttpAgent,
  type AbstractAgent,
  type AgentSubscriber,
} from "@ag-ui/client";
import type { ToolStep } from "./contracts.js";
import { sameOriginEndpoint } from "./endpoint.js";

export type AgentView = {
  status: "idle" | "running" | "blocked" | "complete" | "failed" | "cancelled";
  text: string;
  tools: ToolStep[];
  error?: string;
};
/** Ephemeral projection only. Never use this view as a command or ledger authority. */
export function observeAgent(
  agent: AbstractAgent,
  onChange: (view: AgentView) => void,
): () => void {
  let view: AgentView = { status: "idle", text: "", tools: [] };
  const emit = (patch: Partial<AgentView>) => {
    view = { ...view, ...patch };
    onChange(structuredClone(view));
  };
  const subscriber: AgentSubscriber = {
    onRunStartedEvent: () => {
      emit({ status: "running", text: "", tools: [], error: undefined });
    },
    onTextMessageContentEvent: ({ event, textMessageBuffer }) => {
      emit({ text: textMessageBuffer + event.delta });
    },
    onTextMessageEndEvent: ({ textMessageBuffer }) => {
      emit({ text: textMessageBuffer });
    },
    onToolCallStartEvent: ({ event }) => {
      emit({
        tools: [
          ...view.tools,
          {
            id: event.toolCallId,
            name: event.toolCallName,
            status: "running",
            detail: "Tool requested. Completion is unconfirmed.",
          },
        ],
      });
    },
    // TOOL_CALL_END closes argument streaming. It does not prove successful execution.
    onToolCallEndEvent: ({ event }) => {
      emit({
        tools: view.tools.map((tool) =>
          tool.id === event.toolCallId
            ? {
                ...tool,
                status: "pending",
                detail: "Arguments received; waiting for a result.",
              }
            : tool,
        ),
      });
    },
    onToolCallResultEvent: ({ event }) => {
      emit({
        tools: view.tools.map((tool) =>
          tool.id === event.toolCallId
            ? {
                ...tool,
                status: "complete",
                detail: (typeof event.content === "string"
                  ? event.content
                  : JSON.stringify(event.content)
                ).slice(0, 4000),
              }
            : tool,
        ),
      });
    },
    onRunFinishedEvent: (params) => {
      emit({
        status:
          params.outcome === "interrupt" ||
          (params.outcome === "success" && params.pendingToolCallIds.length)
            ? "blocked"
            : params.outcome === "cancelled"
              ? "cancelled"
              : "complete",
      });
    },
    onRunErrorEvent: ({ event }) => {
      emit({ status: "failed", error: event.message });
    },
    onRunFailed: () => {
      emit({
        status: "failed",
        error:
          "The agent connection failed. Check the host run before retrying.",
      });
    },
  };
  const subscription = agent.subscribe(subscriber);
  return () => subscription.unsubscribe();
}
/** Caller supplies an already authenticated same-origin host AG-UI endpoint. */
export function createGatewayAgent({
  endpoint,
  threadId,
  fetch: fetcher,
}: {
  endpoint: string;
  threadId: string;
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
}): HttpAgent {
  const url = sameOriginEndpoint(endpoint);
  if (!threadId.trim()) throw new Error("A host-owned thread ID is required.");
  return new HttpAgent({ url, threadId, agentId: "starlight", fetch: fetcher });
}
