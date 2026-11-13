"use client";
import type { ComponentProps, ReactNode } from "react";
import { CopilotKitProvider, useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { ComparisonArtifact } from "./components.js";
import { comparisonSchema } from "./contracts.js";
import { sameOriginEndpoint } from "./endpoint.js";

/** No hosted subscription or runtime is provisioned. Host owns this authenticated bridge. */
export function StarlightCopilotProvider({
  runtimeUrl,
  children,
  headers,
  agentId = "starlight",
}: {
  runtimeUrl: string;
  children: ReactNode;
  headers?: ComponentProps<typeof CopilotKitProvider>["headers"];
  agentId?: string;
}) {
  const endpoint = sameOriginEndpoint(runtimeUrl);
  return (
    <CopilotKitProvider
      runtimeUrl={endpoint}
      headers={headers}
      agentId={agentId}
    >
      {children}
    </CopilotKitProvider>
  );
}
/** Read-only frontend tool: no execution, payments, persistence or approval powers. */
export function StarlightComparisonTool() {
  useFrontendTool(
    {
      name: "starlight_show_comparison",
      description:
        "Render a cited deployment comparison for the user to edit. Illustrative scores only.",
      parameters: z.object({ artifact: comparisonSchema }).strict(),
      handler: async () => ({
        displayed: true,
        authority: "presentation-only",
      }),
      render: ({ args }) => {
        const parsed = comparisonSchema.safeParse(args.artifact);
        return parsed.success ? (
          <ComparisonArtifact artifact={parsed.data} />
        ) : (
          <p role="status">Receiving comparison…</p>
        );
      },
    },
    [],
  );
  return null;
}
