# CopilotKit / Zod security follow-up

Observed13November2026. This supersedes the earlier compatibility-only recommendation to pin AG-UI1.0.2/Zod3.25.76 for production. Compatibility is insufficient when the qualified dependency graph contains a high-severity advisory.

## Decision

PROPOSED: production HOLD on optional CopilotKit/A2UI adapters until upstream publishes a compatible patched dependency graph or a bounded independently reviewed patch is deliberately owned. Continue qualifying the Starlight core with official AG-UI client/core1.0.4 and root Zod4.6.7. Do not force nested major overrides or classify Zod4's v3 compatibility subpath as a security fix.

## Verified evidence

- Official GitHub reviewed advisory [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) lists Zod<4.6.6 affected and4.6.6patched; availability impact from resource consumption on large validation collections.
- Upstream fix [a0ebf970f2d752e5f58527cd2942ff48be4f46bd](https://github.com/colinhacks/zod/commit/a0ebf970f2d752e5f58527cd2942ff48be4f46bd) changes only v4source/tests and adds early size gates for bounded arrays/maps/sets. The maintainer's PR[6652](https://github.com/colinhacks/zod/pull/6652) explicitly says unbounded collections are unchanged.
- Published current CopilotKit react-core/core/A2UI renderer remain1.87.1. Core and A2UI renderer depend on Zod^3.25.75; React core/core pin AG-UI1.0.2. No fully patched supported CopilotKit graph was established.
- Published AG-UI client/core1.0.4 support Zod^3.25.18||^4.0.0, allowing a normal non-forced root4.6.7resolution.

## Tested small reproduction

Executed against actual installed Zod4.6.7. Input only10invalid elements; no memory exhaustion test performed.

```js
z.array(z.string()).max(1).safeParse(Array(10).fill(0));
```

| Import | Result |
|---|---|
| root `zod` (v4) |1issue:too_big; early size bound works |
| `zod/v3` compatibility subpath |11issues:too_big+10invalid_type; still walks every element |

TESTED therefore: moving wrapper imports to `zod/v3` within package4.6.7does not repair this behavior. An audit's package-version classification cannot prove subpath-level safety.

## Boundaries to retain

Before any schema traversal, enforce actual streamed body/event byte limits, collection cardinality, nesting depth and string length. These bounds remain necessary on patched v4 because the upstream fix leaves unbounded containers unchanged. Keep CopilotKit optional imports absent from the default production entry/bundle and clearly label experimental demos. Fixture protocol success and wrapper compilation do not admit that upstream path to production.

No root checkout files were edited by this investigation. Registry metadata, official advisory/fix and10element behavior were inspected; no dependency overrides, provider calls or production mutations were performed.
