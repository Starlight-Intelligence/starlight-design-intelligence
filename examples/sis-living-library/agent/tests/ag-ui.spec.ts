import { it, expect } from "vitest";
import { HttpAgent } from "@ag-ui/client";
import {
  createGatewayAgent,
  observeAgent,
  type AgentView,
} from "../src/ag-ui.js";
import { fixtureFetch } from "../src/fixtures.js";
function transport(events: object[]) {
  return async () =>
    new Response(
      events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""),
      { headers: { "Content-Type": "text/event-stream" } },
    );
}
it("runs fragmented SSE through the real pinned AG-UI SDK and projects tool results", async () => {
  const agent = createGatewayAgent({
    endpoint: "/api/fixture",
    threadId: "test-thread",
    fetch: fixtureFetch,
  });
  const views: AgentView[] = [];
  const stop = observeAgent(agent, (view) => views.push(view));
  await agent.runAgent({ runId: "test-run" });
  stop();
  expect(views.some((view) => view.status === "running")).toBe(true);
  expect(views.at(-1)?.status).toBe("complete");
  expect(views.at(-1)?.text).toContain("Edit the quality weight");
  expect(views.some((view) => view.tools[0]?.status === "pending")).toBe(true);
  expect(views.at(-1)?.tools[0]?.status).toBe("complete");
  expect(agent.state.artifact.kind).toBe("comparison");
});
it("never treats argument-stream end as successful tool execution", async () => {
  const agent = new HttpAgent({
    url: "/fixture",
    threadId: "t",
    fetch: transport([
      { type: "RUN_STARTED", threadId: "t", runId: "r" },
      {
        type: "TOOL_CALL_START",
        toolCallId: "tool",
        toolCallName: "unconfirmed",
      },
      { type: "TOOL_CALL_ARGS", toolCallId: "tool", delta: "{}" },
      { type: "TOOL_CALL_END", toolCallId: "tool" },
      { type: "RUN_FINISHED", threadId: "t", runId: "r" },
    ]),
  });
  let final: AgentView | undefined;
  const stop = observeAgent(agent, (view) => {
    final = view;
  });
  await agent.runAgent({ runId: "r" });
  stop();
  expect(final?.status).toBe("blocked");
  expect(final?.tools[0]?.status).toBe("pending");
});
it("projects provider error separately from completion", async () => {
  const agent = new HttpAgent({
    url: "/fixture",
    threadId: "t",
    fetch: transport([
      { type: "RUN_STARTED", threadId: "t", runId: "r" },
      { type: "RUN_ERROR", message: "Host unavailable" },
    ]),
  });
  let final: AgentView | undefined;
  const stop = observeAgent(agent, (view) => {
    final = view;
  });
  await agent.runAgent({ runId: "r" }).catch(() => {});
  stop();
  expect(final?.status).toBe("failed");
});
