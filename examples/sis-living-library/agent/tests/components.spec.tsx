// @vitest-environment jsdom
import { afterEach, it, expect, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import {
  AgentTranscript,
  ArtifactRenderer,
  BoundApproval,
} from "../src/components.js";
import { makeProposal } from "../src/fixtures.js";
import { StarlightA2UISurface, validateA2UIMessages } from "../src/a2ui.js";
import type { Decision } from "../src/contracts.js";
import { a2uiMessages } from "../src/fixtures.js";
afterEach(cleanup);
it("only sends the exact proposal once until host acknowledgement", async () => {
  let resolve!: () => void;
  const callback = vi.fn(
    (_decision: Decision) =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  const proposal = makeProposal();
  render(<BoundApproval proposal={proposal} onDecision={callback} />);
  fireEvent.click(screen.getByRole("button", { name: /Approve action/ }));
  fireEvent.click(screen.getByRole("button", { name: /Approve action/ }));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback.mock.calls[0]?.[0]).toEqual({
    proposal,
    decision: "approved",
  });
  resolve();
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Approved"),
  );
});
it("a new revision cannot inherit an old in-flight acknowledgement", async () => {
  let resolve!: () => void;
  const callback = vi.fn(
    (_decision: Decision) =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  const proposal = makeProposal();
  const view = render(
    <BoundApproval proposal={proposal} onDecision={callback} />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Approve action/ }));
  view.rerender(
    <BoundApproval
      proposal={{ ...proposal, revision: 2 }}
      onDecision={callback}
    />,
  );
  resolve();
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Awaiting review"),
  );
  expect(
    screen
      .getByRole("button", { name: /Approve action/ })
      .hasAttribute("disabled"),
  ).toBe(false);
});
it("expired proposals never invoke the host", () => {
  const callback = vi.fn();
  render(
    <BoundApproval
      proposal={{ ...makeProposal(), expiresAt: "2020-01-01T00:00:00Z" }}
      onDecision={callback}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Approve action/ }));
  expect(callback).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain("expired");
});
it("an uncertain acknowledgement does not silently retry", async () => {
  const callback = vi.fn().mockRejectedValue(new Error("lost acknowledgement"));
  render(<BoundApproval proposal={makeProposal()} onDecision={callback} />);
  fireEvent.click(screen.getByRole("button", { name: /Reject/ }));
  await screen.findByRole("alert");
  expect(
    screen
      .getByRole("button", { name: /Approve action/ })
      .hasAttribute("disabled"),
  ).toBe(true);
});
it("preserves chat drafts on error", async () => {
  render(
    <AgentTranscript
      messages={[]}
      onSubmit={async () => {
        throw new Error("offline");
      }}
    />,
  );
  fireEvent.change(screen.getByLabelText("Your request"), {
    target: { value: "My useful request" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send request" }));
  await screen.findByRole("alert");
  expect(
    (screen.getByLabelText("Your request") as HTMLInputElement).value,
  ).toBe("My useful request");
});
it("unknown artifacts never reach a custom renderer", () => {
  const compare = vi.fn();
  render(
    <ArtifactRenderer
      input={{ kind: "html", html: "<img onerror=alert(1)>" }}
      registry={{ comparison: compare, report: vi.fn() }}
    />,
  );
  expect(compare).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeTruthy();
});
it("renders the published native A2UI 1.0 catalog with existing Starlight surface", async () => {
  render(<StarlightA2UISurface messages={a2uiMessages} />);
  expect(
    await screen.findByRole("heading", {
      name: "A declared surface. Your components.",
    }),
  ).toBeTruthy();
});
it.each([
  [
    {
      version: "0.9",
      createSurface: {
        surfaceId: "starlight-report",
        catalogId: "starlight://living-agent/v1",
      },
    },
    a2uiMessages[1],
  ],
  [
    a2uiMessages[0],
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "starlight-report",
        components: [
          { id: "root", component: "iframe", title: "bad", body: "bad" },
        ],
      },
    },
  ],
  [
    a2uiMessages[0],
    {
      version: "1.0",
      updateComponents: {
        surfaceId: "starlight-report",
        components: [
          {
            id: "root",
            component: "StarlightNote",
            title: "bad",
            body: "bad",
            action: { publish: true },
          },
        ],
      },
    },
  ],
])(
  "rejects native protocol/catalog escalation %# before rendering",
  (...value) => {
    expect(() => validateA2UIMessages(value)).toThrow();
  },
);

import { AgentWorkbench } from "../src/Workbench.js";
it("gives the theme selector a stable accessible name", () => {
  render(<AgentWorkbench />);
  const selector = screen.getByRole("combobox", { name: /^Theme$/ });
  fireEvent.change(selector, { target: { value: "daylight" } });
  expect(
    document.querySelector(".sla-workbench")?.getAttribute("data-theme"),
  ).toBe("daylight");
});
