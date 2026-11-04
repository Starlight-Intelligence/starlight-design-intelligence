---
name: bind-character-runtime
description: "Map character and agent contracts onto verified infrastructure. Use when connecting Starlight living-design metadata to GitHub, existing Next.js/Vercel apps, Cloudflare entities, MCP connectors, telemetry, or a provider-specific runtime adapter."
---

# Bind character runtime

## Purpose

Prepare a small adapter that lets an existing product render the correct character and capability state without creating a second control plane.

## Inputs

Read [architecture and standards](../../plugins/starlight-living-design/assets/living-design/docs/architecture-and-standards.md), current reviewed Registry records, the owning product's instructions, character/agent contracts, and actual runtime/tool observations. Recheck provider documentation for implementation-sensitive behavior.

## Workflow

1. Resolve source ownership and the exact product/runtime to extend. Reuse existing IDs and APIs. Treat this package's dated infrastructure observations as discovery evidence only.
2. Keep identity and design definitions in versioned Git. Compile a bounded read projection with source revisions and checksums. Keep credentials, tenant records, and private reference images outside public Git.
3. Connect the projection to the existing product surface. Use Vercel/Next.js for the default web experience and current media policy for asset delivery. Use Cloudflare stateful entities only when persistent coordination or identity requires them.
4. Choose one durable orchestrator for each workflow according to its existing owner. Never mirror one process across providers to make the map look complete.
5. Map runtime events to typed UI states. Include stable agent and run references, ordered events, freshness, artifact/receipt references, and recoverable failures. Reject out-of-scope or stale updates; do not trust a client-supplied tenant ID as authorization.
6. Resolve connectors through their actual host/runtime. Separate configuration from authorization and successful invocation. Enforce least privilege on the server; the character, SOUL.md, skill, or graph edge cannot extend grants.
7. Keep provider/model session IDs as adapter details. A model change must preserve the job's output contract and pass its evaluations.
8. Test a permitted read, denied/revoked access, duplicate/out-of-order events, cancellation, missing reference, and reconnect. Use synthetic fixtures before authorized live smoke tests.

## Output contract

Return a source/consumer map, adapter contract or bounded code change, connector-evidence matrix, tests, cost boundary, rollback, and exact deployment status. Report “Inverso” as unresolved until an authoritative product identity is supplied or found; never silently reinterpret it as Vercel.

## Tools and boundaries

Use the existing GitHub, hosting, runtime, and connector tools. This skills-only plugin adds no server, account connection, background worker, database, or native MCP tool. State explicitly which dependent implementation remains outside the package.

## Quality bar

One source definition may feed several views; tenant authorization remains checked at use time. A deployment inventory is not a successful product interaction. No claim of live operation without an observed receipt.

## Example

“Show Helix on an existing Cloudflare-backed archive screen.” Map the existing archival entity's verified states into the app's inspector; retain its permissions and orchestrator; show an unknown connection state when evidence is absent.
