# Example invocations

**Claude Code**
```
Use the infogenius skill. Brief: one-page explainer of Starlight agent orchestration for operators.
Brand: sis. Surface: 1440x888 diagram, dark+light. Technical topic: no character unless you can name an
understanding gain and the casting resolver approves. Run independent critique in a separate agent.
```

**Codex** (repository `AGENTS.md` hook)
```
Read skills/infogenius/SKILL.md. Follow its sequence for brief benchmarks/infogenius/briefs.json#05.
Compile with scripts/compile-brand-diagrams.mjs, then hand the SVGs to a second session for critique
against benchmarks/infogenius/RUBRIC.md. Return receipt.json.
```

**Existing Starlight workflow** (`brand-image-system/runtime/workflows/infographic` or `character-hud-infographic`)
```
Run workflow `infographic` for brand frankx. At the "main visual" step delegate to infogenius:
stages Brief→Receipt, deterministic labels only. Write outputs to the workflow's requiredOutputs paths and attach receipt.json as evidence.json.
```

**Benchmark render**
```
node scripts/render-infogenius-benchmark.mjs --out benchmarks/infogenius/renders
```
