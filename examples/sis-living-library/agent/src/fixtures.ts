import type { Comparison, Report, Proposal } from "./contracts.js";

export const comparison: Comparison = {
  kind: "comparison",
  title: "Choose what you want to own.",
  rows: [
    {
      id: "managed",
      name: "Managed endpoint",
      quality: 85,
      cost: 65,
      sourceId: "scope",
    },
    {
      id: "owned",
      name: "Self-hosted service",
      quality: 70,
      cost: 30,
      sourceId: "boundary",
    },
  ],
  sources: [
    {
      id: "scope",
      title: "AG-UI: agent and interface events",
      url: "https://docs.ag-ui.com/introduction",
      excerpt:
        "Protocol reference. Numerical scores in this demo are authored fixtures, not benchmark results.",
    },
    {
      id: "boundary",
      title: "Starlight Living Design source candidate",
      url: "https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/97",
      excerpt:
        "Existing source boundary. Hosting costs and operational effort need separate measurement.",
    },
  ],
};
export const researchReport: Report = {
  kind: "report",
  title: "Deployment decision / review copy",
  findings: [
    {
      text: "Both options can expose an AG-UI stream. The application retains authority over identity, spend and durable state.",
      sourceId: "scope",
    },
    {
      text: "Choose a managed endpoint for the initial experiment; revisit ownership with measured workloads. This recommendation is illustrative.",
      sourceId: "boundary",
    },
  ],
  sources: comparison.sources,
};
export const makeProposal = (runId = "demo-browser"): Proposal => ({
  id: "capture-proposal",
  revision: 1,
  runId,
  tool: "fixture.capture_page",
  scope: "Read the displayed fixture only; no external browsing or publishing.",
  arguments: {
    url: "https://example.com/architecture",
    destination: "local-demo",
    includeCookies: false,
  },
  expiresAt: new Date(Date.now() + 300_000).toISOString(),
});
export const a2uiMessages = [
  {
    version: "1.0",
    createSurface: {
      surfaceId: "starlight-report",
      catalogId: "starlight://living-agent/v1",
    },
  },
  {
    version: "1.0",
    updateComponents: {
      surfaceId: "starlight-report",
      components: [
        {
          id: "root",
          component: "StarlightNote",
          title: "A declared surface. Your components.",
          body: "This native A2UI 1.0 message can render one validated Starlight note. Unknown components, actions, catalogs and data bindings are rejected before the renderer.",
        },
      ],
    },
  },
];

/** Actual AG-UI SDK transport rehearsal; authored in-memory SSE, no provider/network. */
export function fixtureFetch(
  _url: string,
  init: RequestInit,
): Promise<Response> {
  const input = JSON.parse(String(init.body)) as {
    threadId: string;
    runId: string;
  };
  const events = [
    { type: "RUN_STARTED", threadId: input.threadId, runId: input.runId },
    { type: "TEXT_MESSAGE_START", messageId: "answer", role: "assistant" },
    {
      type: "TEXT_MESSAGE_CONTENT",
      messageId: "answer",
      delta: "I compared the two deployment options. ",
    },
    {
      type: "TEXT_MESSAGE_CONTENT",
      messageId: "answer",
      delta:
        "Edit the quality weight to see how your priorities change the ranking.",
    },
    { type: "TEXT_MESSAGE_END", messageId: "answer" },
    {
      type: "TOOL_CALL_START",
      toolCallId: "comparison-tool",
      toolCallName: "starlight_show_comparison",
    },
    {
      type: "TOOL_CALL_ARGS",
      toolCallId: "comparison-tool",
      delta: JSON.stringify({ artifact: comparison }),
    },
    { type: "TOOL_CALL_END", toolCallId: "comparison-tool" },
    {
      type: "TOOL_CALL_RESULT",
      messageId: "tool-result",
      toolCallId: "comparison-tool",
      role: "tool",
      content: "Validated fixture comparison ready.",
    },
    {
      type: "STATE_SNAPSHOT",
      snapshot: { artifact: comparison, provenance: "fixture" },
    },
    { type: "RUN_FINISHED", threadId: input.threadId, runId: input.runId },
  ];
  const encoder = new TextEncoder();
  // Fragment every event to exercise the official streaming decoder, including split JSON.
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        const bytes = encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
        const middle = Math.floor(bytes.length / 2);
        controller.enqueue(bytes.slice(0, middle));
        controller.enqueue(bytes.slice(middle));
      }
      controller.close();
    },
  });
  return Promise.resolve(
    new Response(stream, { headers: { "Content-Type": "text/event-stream" } }),
  );
}
