"use client";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { z as legacyZod } from "zod3-compat";
import {
  A2UIProvider,
  A2UIRenderer,
  createCatalog,
  useA2UIActions,
} from "@copilotkit/a2ui-renderer";
import { GlassSurface } from "@starlight/living-design";

const noteProps = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(4000),
  })
  .strict();
const noteSchema = noteProps
  .extend({ id: z.literal("root"), component: z.literal("StarlightNote") })
  .strict();
export const starlightCatalog = createCatalog(
  {
    StarlightNote: {
      props: legacyZod
        .object({
          title: legacyZod.string().min(1).max(200),
          body: legacyZod.string().min(1).max(4000),
        })
        .strict(),
    },
  },
  {
    StarlightNote: ({ props }) => (
      <GlassSurface className="sla-artifact">
        <h3>{props.title}</h3>
        <p>{props.body}</p>
      </GlassSurface>
    ),
  },
  {
    catalogId: "starlight://living-agent/v1",
    protocolVersion: "1.0",
    includeBasicCatalog: false,
  },
);
const messagesSchema = z.tuple([
  z
    .object({
      version: z.literal("1.0"),
      createSurface: z
        .object({
          surfaceId: z.literal("starlight-report"),
          catalogId: z.literal("starlight://living-agent/v1"),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      version: z.literal("1.0"),
      updateComponents: z
        .object({
          surfaceId: z.literal("starlight-report"),
          components: z.tuple([noteSchema]),
        })
        .strict(),
    })
    .strict(),
]);
/** Deliberately narrow native A2UI 1.0 support. No default catalog/actions/bindings. */
export function validateA2UIMessages(input: unknown) {
  if (JSON.stringify(input)?.length > 12_000)
    throw new Error("A2UI surface exceeds the rendering limit.");
  return messagesSchema.parse(input);
}
export function StarlightA2UISurface({ messages }: { messages: unknown }) {
  const parsed = useMemo(() => {
    try {
      return validateA2UIMessages(messages);
    } catch {
      return null;
    }
  }, [messages]);
  if (!parsed)
    return (
      <p role="alert">
        Unsupported A2UI surface. Request the Starlight 1.0 note catalog.
      </p>
    );
  return (
    <A2UIProvider catalog={starlightCatalog}>
      <Surface messages={parsed} />
    </A2UIProvider>
  );
}
function Surface({
  messages,
}: {
  messages: ReturnType<typeof validateA2UIMessages>;
}) {
  const { processMessages } = useA2UIActions();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      processMessages(messages);
    } catch {
      setFailed(true);
    }
  }, [messages, processMessages]);
  return failed ? (
    <p role="alert">The A2UI surface could not render.</p>
  ) : (
    <A2UIRenderer
      surfaceId="starlight-report"
      fallback={<p role="status">Preparing the A2UI surface…</p>}
    />
  );
}
