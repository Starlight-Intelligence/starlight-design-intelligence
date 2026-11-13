import { z } from "zod";

const text = z.string().trim().min(1).max(4000);
const id = z.string().regex(/^[a-zA-Z0-9_.:-]{1,128}$/);
const source = z
  .object({
    id,
    title: text,
    url: z
      .string()
      .url()
      .max(2048)
      .refine(
        (value) =>
          new URL(value).protocol === "https:" &&
          !/[\u0000-\u0020\u007f]/.test(value),
        "HTTPS sources without control characters only",
      )
      .transform((value) => new URL(value).href),
    excerpt: text,
  })
  .strict();
export const comparisonSchema = z
  .object({
    kind: z.literal("comparison"),
    title: text,
    rows: z
      .array(
        z
          .object({
            id,
            name: text,
            quality: z.number().finite().min(0).max(100),
            cost: z.number().finite().min(0).max(100),
            sourceId: id,
          })
          .strict(),
      )
      .min(1)
      .max(20),
    sources: z.array(source).min(1).max(40),
  })
  .strict()
  .superRefine((artifact, ctx) => {
    const ids = new Set(artifact.sources.map((value) => value.id));
    if (
      ids.size !== artifact.sources.length ||
      new Set(artifact.rows.map((value) => value.id)).size !==
        artifact.rows.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate artifact identifiers",
      });
    if (artifact.rows.some((row) => !ids.has(row.sourceId)))
      ctx.addIssue({
        code: "custom",
        message: "Every comparison row needs a source",
      });
  });
export const reportSchema = z
  .object({
    kind: z.literal("report"),
    title: text,
    findings: z
      .array(z.object({ text, sourceId: id }).strict())
      .min(1)
      .max(40),
    sources: z.array(source).min(1).max(40),
  })
  .strict()
  .superRefine((artifact, ctx) => {
    const ids = new Set(artifact.sources.map((value) => value.id));
    if (
      ids.size !== artifact.sources.length ||
      artifact.findings.some((finding) => !ids.has(finding.sourceId))
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid report source references",
      });
  });
export const artifactSchema = z.union([comparisonSchema, reportSchema]);
export type Comparison = z.infer<typeof comparisonSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Artifact = z.infer<typeof artifactSchema>;

/** An ephemeral presentation contract. The host validates its own durable command. */
export const proposalSchema = z
  .object({
    id,
    revision: z.number().int().nonnegative(),
    runId: id,
    tool: id,
    scope: text,
    arguments: z
      .record(
        z.string().min(1).max(128),
        z.union([
          z.string().max(4000),
          z.number().finite(),
          z.boolean(),
          z.null(),
        ]),
      )
      .refine(
        (value) =>
          Object.keys(value).length <= 30 &&
          JSON.stringify(value).length <= 32_000,
      ),
    expiresAt: z.string().datetime(),
  })
  .strict();
export type Proposal = z.infer<typeof proposalSchema>;
export type Decision = {
  proposal: Proposal;
  decision: "approved" | "rejected";
};
export type ToolStep = {
  id: string;
  name: string;
  status: "pending" | "running" | "complete" | "failed";
  detail: string;
};
export type MissionAgent = {
  id: string;
  name: string;
  role: string;
  status: "unknown" | "idle" | "running" | "blocked" | "complete";
  evidence: string;
};

/** Shape, size and catalog validation before any registry dispatch. Never evaluate UI code. */
export function parseArtifact(input: unknown): Artifact {
  const serialized = JSON.stringify(input);
  if (!serialized || serialized.length > 100_000)
    throw new Error("Artifact exceeds the local rendering limit.");
  return artifactSchema.parse(input);
}
export function reportMarkdown(report: Report): string {
  report = reportSchema.parse(report);
  // JSON carries the exact source; Markdown escapes syntax supplied by an agent.
  const escape = (value: string) =>
    value.replace(/[\\`*_{}\[\]()#+.!<>|~-]/g, "\\$&").replace(/[\r\n]+/g, " ");
  return `# ${escape(report.title)}\n\n${report.findings.map((finding) => `- ${escape(finding.text)} [${escape(finding.sourceId)}]`).join("\n")}\n\n## Sources\n\n${report.sources.map((value) => `- ${escape(value.id)}: ${escape(value.title)} ${value.url}`).join("\n")}\n`;
}
