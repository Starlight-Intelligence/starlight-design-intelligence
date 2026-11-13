"use client";
import { lazy, Suspense, useState } from "react";
import {
  GlassSurface,
  Icon,
  ModelSelector,
  StarlightButton,
  UsageDisplay,
} from "@starlight/living-design";
import {
  AgentTranscript,
  ArtifactRenderer,
  BoundApproval,
  BrowserActivity,
  MissionRoster,
  ResearchReport,
  ToolTimeline,
} from "./components.js";
import { createGatewayAgent, observeAgent, type AgentView } from "./ag-ui.js";
import {
  parseArtifact,
  reportMarkdown,
  type Decision,
  type MissionAgent,
  type Proposal,
} from "./contracts.js";
import {
  a2uiMessages,
  comparison,
  fixtureFetch,
  makeProposal,
  researchReport,
} from "./fixtures.js";
const A2UISurface = lazy(() =>
  import("./a2ui.js").then((module) => ({
    default: module.StarlightA2UISurface,
  })),
);
const demos = [
  "Conversation",
  "Approval",
  "Mission",
  "Browser",
  "Research",
  "A2UI",
] as const;
type Demo = (typeof demos)[number];
const roles: MissionAgent[] = [
  {
    id: "research",
    name: "Research",
    role: "Compare evidence",
    status: "idle",
    evidence: "Waiting for the local mission.",
  },
  {
    id: "architect",
    name: "Architect",
    role: "Inspect the boundary",
    status: "idle",
    evidence: "Waiting for research.",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    role: "Check the recommendation",
    status: "idle",
    evidence: "Waiting for the architecture note.",
  },
];
export function AgentWorkbench() {
  const [active, setActive] = useState<Demo>("Conversation");
  const [theme, setTheme] = useState("midnight");
  const [model, setModel] = useState("fixture");
  const [view, setView] = useState<AgentView>({
    status: "idle",
    text: "",
    tools: [],
  });
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [artifact, setArtifact] = useState<unknown>(null);
  const [proposal, setProposal] = useState<Proposal>(() => makeProposal());
  const [receipt, setReceipt] = useState<{ id: string; result: string }>();
  const [mission, setMission] = useState(0);
  const [exported, setExported] = useState(false);
  const [offline, setOffline] = useState(false);
  async function submit(text: string) {
    setView({ status: "running", text: "", tools: [] });
    setArtifact(null);
    setMessages((previous) => [
      ...previous,
      { id: String(previous.length), role: "user", content: text },
    ]);
    const agent = createGatewayAgent({
      endpoint: "/fixture-not-a-network-route",
      threadId: `demo-${Date.now()}`,
      fetch: fixtureFetch,
    });
    agent.addMessage({ id: "user-request", role: "user", content: text });
    const stop = observeAgent(agent, setView);
    try {
      await agent.runAgent({ runId: `demo-${Date.now()}` });
      setArtifact(parseArtifact(agent.state.artifact));
      setMessages((previous) => [
        ...previous,
        {
          id: String(previous.length),
          role: "assistant",
          content: agent.messages
            .filter((message) => message.role === "assistant")
            .map((message) =>
              typeof message.content === "string" ? message.content : "",
            )
            .join("\n"),
        },
      ]);
    } catch (error) {
      setView((previous) => ({
        ...previous,
        status: "failed",
        error:
          "The comparison failed. Your previous messages are preserved; try again.",
      }));
      throw error;
    } finally {
      stop();
    }
  }
  async function decide(decision: Decision) {
    // This is the fixture host boundary, not a reusable authorization service.
    if (
      JSON.stringify(decision.proposal) !== JSON.stringify(proposal) ||
      Date.parse(proposal.expiresAt) <= Date.now() ||
      receipt
    )
      throw new Error("Proposal no longer current.");
    setReceipt({
      id: `fixture-${proposal.revision}`,
      result:
        decision.decision === "approved"
          ? "Displayed fixture captured locally. No external page was read."
          : "Rejected. No capture was performed.",
    });
  }
  function downloadReport() {
    const blob = new Blob([reportMarkdown(researchReport)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "starlight-research-demo.md";
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  }
  return (
    <div className="sla-workbench" data-theme={theme}>
      <a className="sla-skip" href="#agent-main">
        Skip to workspace
      </a>
      <header className="sla-topbar">
        <a href="./" className="sla-brand">
          <Icon name="spark" />
          <strong>starlight</strong>
          <span>Living Agent UI</span>
        </a>
        <label>
          Theme{" "}
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="midnight">Midnight</option>
            <option value="daylight">Daylight</option>
            <option value="ember">Ember</option>
          </select>
        </label>
      </header>
      <div className="sla-demo-notice">
        <span>Interactive source candidate</span>
        <span>Fixture data · official AG-UI decoder · no connected agent</span>
      </div>
      <main id="agent-main">
        <div className="sla-intro">
          <div>
            <h1>The work, in full view.</h1>
            <p>
              Ask. Inspect the evidence. Make the decision.
              <br />
              Keep every layer of your application yours.
            </p>
          </div>
          <div className="sla-intro-meta">
            <strong>Living Design 0.2.0</strong>
            <span>Agent Experience 0.1.0 RC</span>
            <a href="https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/97">
              Recovered source foundation <Icon name="arrowUpRight" size={14} />
            </a>
          </div>
        </div>
        <nav className="sla-demo-nav" aria-label="Agent demonstrations">
          {demos.map((demo) => (
            <button
              key={demo}
              aria-current={active === demo ? "page" : undefined}
              onClick={() => {
                setActive(demo);
              }}
            >
              {demo}
            </button>
          ))}
        </nav>
        <div className="sla-work-grid">
          <section
            className="sla-main-pane"
            aria-label={`${active} demonstration`}
          >
            <div className="sla-section-title">
              <h2>
                {active === "Conversation"
                  ? "From a request to a useful artifact."
                  : active === "Approval"
                    ? "A decision with an exact scope."
                    : active === "Mission"
                      ? "Three roles. One inspectable outcome."
                      : active === "Browser"
                        ? "The page stays beside the action."
                        : active === "Research"
                          ? "A report you can take with you."
                          : "The agent declares. Your catalog renders."}
              </h2>
              <span className="sla-note">
                {active === "Conversation"
                  ? `Stream: ${view.status}`
                  : "Local demonstration"}
              </span>
            </div>
            {active === "Conversation" && (
              <>
                <AgentTranscript
                  messages={messages}
                  onSubmit={submit}
                  busy={view.status === "running"}
                  disabled={offline}
                />
                {view.status === "running" && (
                  <p role="status">Receiving AG-UI events…</p>
                )}
                {view.error && <p role="alert">{view.error}</p>}
                {artifact ? (
                  <div className="sla-result">
                    <ArtifactRenderer input={artifact} />
                  </div>
                ) : (
                  <div className="sla-empty">
                    <Icon name="layers" size={28} />
                    <h3>Your next decision belongs here.</h3>
                    <p>
                      Send any request to run the deterministic deployment
                      comparison through the official AG-UI client.
                    </p>
                    <StarlightButton
                      variant="secondary"
                      disabled={offline || view.status === "running"}
                      onClick={() =>
                        void submit(
                          "Compare managed and self-hosted deployment.",
                        ).catch(() => {})
                      }
                    >
                      Run the sample analysis
                    </StarlightButton>
                  </div>
                )}
              </>
            )}
            {active === "Approval" && (
              <>
                {!receipt && (
                  <BoundApproval proposal={proposal} onDecision={decide} />
                )}{" "}
                {receipt && (
                  <p role="status">
                    {receipt.result} Receipt: {receipt.id}
                  </p>
                )}
                <StarlightButton
                  variant="secondary"
                  onClick={() => {
                    setReceipt(undefined);
                    setProposal({
                      ...makeProposal(),
                      revision: proposal.revision + 1,
                    });
                  }}
                >
                  Request a new proposal
                </StarlightButton>
              </>
            )}
            {active === "Mission" && (
              <>
                <MissionRoster
                  agents={roles.map((role, index) => ({
                    ...role,
                    status:
                      index < mission
                        ? "complete"
                        : index === mission
                          ? "running"
                          : "idle",
                    evidence:
                      index < mission
                        ? [
                            "Two fixture sources attached.",
                            "Runtime authority remains host-owned.",
                            "Recommendation reviewed; report ready.",
                          ][index]!
                        : role.evidence,
                  }))}
                />
                <div className="sla-mission-action">
                  <StarlightButton
                    disabled={mission === 3}
                    onClick={() => setMission((value) => value + 1)}
                  >
                    {mission === 3
                      ? "Mission complete"
                      : "Advance one fixture contribution"}
                  </StarlightButton>
                  <StarlightButton
                    variant="ghost"
                    onClick={() => setMission(0)}
                  >
                    Reset mission
                  </StarlightButton>
                </div>
                {mission === 3 && (
                  <ResearchReport
                    artifact={researchReport}
                    onExport={downloadReport}
                  />
                )}
              </>
            )}
            {active === "Browser" && (
              <>
                <BrowserActivity
                  page={{
                    title: "Architecture brief / fixture page",
                    url: "https://example.com/architecture",
                    capturedAt: "2026-11-13T12:00:00Z",
                  }}
                  plan={[
                    "Read the displayed architecture fixture.",
                    "Extract its deployment constraints.",
                    "Return a local capture receipt.",
                  ]}
                  receipt={receipt}
                />
                {!receipt && (
                  <BoundApproval proposal={proposal} onDecision={decide} />
                )}
              </>
            )}
            {active === "Research" && (
              <>
                <ResearchReport
                  artifact={researchReport}
                  onExport={downloadReport}
                />
                <p role="status">
                  {exported
                    ? "Cited Markdown exported locally."
                    : "The export preserves source references and fixture labels."}
                </p>
              </>
            )}
            {active === "A2UI" && (
              <>
                <p className="sla-note">
                  Native A2UI 1.0 · one allowlisted component · authored message
                  fixture
                </p>
                <Suspense
                  fallback={
                    <p role="status">Loading the optional A2UI renderer…</p>
                  }
                >
                  <A2UISurface messages={a2uiMessages} />
                </Suspense>
              </>
            )}
          </section>
          <aside className="sla-context" aria-label="Execution context">
            <h2>Execution context</h2>
            <ModelSelector
              label="Model profile"
              models={[
                {
                  id: "fixture",
                  name: "Deterministic fixture",
                  detail: "No model provider or hosted subscription.",
                },
              ]}
              value={model}
              onChange={setModel}
            />
            <div className="sla-context-block">
              <h3>Tool activity</h3>
              <ToolTimeline steps={view.tools} />
            </div>
            <div className="sla-context-block">
              <UsageDisplay
                inputTokens={null}
                outputTokens={null}
                limit={null}
              />
              <p className="sla-note">
                Provider cost: unknown. No inference request.
              </p>
            </div>
            <details className="sla-context-block">
              <summary>Integration boundary</summary>
              <p>
                The package presents ephemeral state. Your host owns auth,
                memory, approvals, billing and workflow receipts.
              </p>
              <p>
                CopilotKit uses a host-supplied runtime bridge. This sample has
                no production gateway connection.
              </p>
            </details>
            <label className="sla-offline">
              <input
                type="checkbox"
                checked={offline}
                onChange={(event) => setOffline(event.target.checked)}
              />{" "}
              Simulate offline state
            </label>
            {offline && (
              <p role="status">
                Offline specimen: requests paused; existing results remain
                available.
              </p>
            )}
          </aside>
        </div>
        <footer className="sla-footer">
          <span>
            Existing Glass Core. Typed agent interactions. Replaceable adapters.
          </span>
          <span>Preview only · purchase unavailable</span>
        </footer>
      </main>
    </div>
  );
}
