import { describe, it, expect } from "vitest";
import {
  parseArtifact,
  reportMarkdown,
  proposalSchema,
} from "../src/contracts.js";
import { sameOriginEndpoint } from "../src/endpoint.js";
import { comparison, researchReport, makeProposal } from "../src/fixtures.js";
describe("Controlled artifact contracts", () => {
  it("accepts a cited comparison and report", () => {
    expect(parseArtifact(comparison).kind).toBe("comparison");
    expect(parseArtifact(researchReport).kind).toBe("report");
  });
  it.each([
    { kind: "html", html: "<script>alert(1)</script>" },
    { ...comparison, script: "alert(1)" },
    { ...comparison, rows: [{ ...comparison.rows[0], quality: Infinity }] },
    { ...comparison, rows: [{ ...comparison.rows[0], sourceId: "missing" }] },
    {
      ...comparison,
      sources: [{ ...comparison.sources[0], url: "javascript:alert(1)" }],
    },
    { ...comparison, sources: [comparison.sources[0], comparison.sources[0]] },
    {
      ...researchReport,
      findings: [{ text: "Unsupported", sourceId: "missing" }],
    },
    { ...comparison, title: "x".repeat(101_000) },
  ])("rejects unsafe/unsupported artifact %#", (value) => {
    expect(() => parseArtifact(value)).toThrow();
  });
  it("exports source references and escapes agent markdown", () => {
    const markdown = reportMarkdown({
      ...researchReport,
      title: "<script>*title*",
    });
    expect(markdown).toContain("\\<script\\>\\*title\\*");
    expect(markdown).toContain("https://docs.ag-ui.com/introduction");
    expect(markdown).toContain("[scope]");
  });
  it("rejects nested execution arguments and invalid expiry", () => {
    expect(
      proposalSchema.safeParse({
        ...makeProposal(),
        arguments: { command: { secret: true } },
      }).success,
    ).toBe(false);
    expect(
      proposalSchema.safeParse({ ...makeProposal(), expiresAt: "tomorrow" })
        .success,
    ).toBe(false);
  });
});
describe("Same-origin host endpoints", () => {
  it("normalizes a relative host path", () => {
    expect(sameOriginEndpoint("/api/./ag-ui?version=1")).toBe(
      "/api/ag-ui?version=1",
    );
  });
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "/\t/evil.example",
    "/\\evil.example",
    "/api#fragment",
    " /api",
    "/api\u0000",
    "/api/..//evil.example",
    "/api/%2e%2e//evil.example",
  ])("rejects %j", (value) => {
    expect(() => sameOriginEndpoint(value)).toThrow();
  });
});

it("rejects control-bearing export URLs and bounds argument keys", () => {
  expect(() =>
    reportMarkdown({
      ...researchReport,
      sources: [
        {
          ...researchReport.sources[0]!,
          url: "https://example.com/\n\n<img onerror=alert(1)>",
        },
      ],
    }),
  ).toThrow();
  expect(
    proposalSchema.safeParse({
      ...makeProposal(),
      arguments: { ["x".repeat(10000)]: true },
    }).success,
  ).toBe(false);
});
