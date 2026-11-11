# Living design architecture

Version 0.1.0 · 29 October 2026 · proposed reusable design system.

The product unit is a useful role with an inspectable result. A character makes that role recognizable across the homepage, workspace, learning journey, and contribution history. The same character can represent different permitted instances of a role; its appearance never establishes access or execution.

## Identity layers

| Entity | Owns | Does not establish |
| --- | --- | --- |
| Character | Name, silhouette, ancestry, identity anchors | Runtime existence or permission |
| Design family | Materials, form grammar, light, habitat, motion vocabulary | Operational team hierarchy |
| Companion | A user-facing relationship and interaction pattern | Independent agent or permanent memory |
| Agent role | Job, output contract, owner, capability requirements, limits | A running process |
| Runtime instance | A scoped execution identity and its actual state | Brand or character canon |
| Avatar | A rendition of a character at a UI size/state | A new character |
| Mascot | Symbolic recognition and cultural meaning | Tool access |
| World entity | Fictional place or character within an authored world | Factual product behavior |
| Skill | A reusable capability workflow | Credentials or autonomous operation |
| Playbook | Ordered work, handoffs, acceptance, and recovery | A scheduler |
| Connector | A typed external capability and its evidence requirements | A successful authenticated call |

Use functional role IDs alongside display names. Preserve character ID, role ID, tenant-scoped runtime ID, provider/model, and run ID separately. A new coat of glass does not justify another runtime agent. A model upgrade does not require a new character identity.

## Markdown contracts

These filenames are Starlight project conventions. Their meaning comes from this package and the owning application; they are not universal agent standards.

| File | Required decision |
| --- | --- |
| AGENT.md | Job, accountable owner, inputs/outputs, skills, playbooks, tools, memory boundary, limits, completion, cancellation, recovery |
| CHARACTER.md | Stable candidate/accepted identity, visual lineage, recognition anchors, references, permitted derivatives |
| DESIGN.md | Surface mode, material/color/type roles, size variants, component use, state presentation, static fallback |
| SOUL.md | Values, priorities under tension, refusal to misrepresent evidence, respect for user agency |
| PERSONALITY.md | Voice, pacing, initiative, humor, uncertainty language, failure behavior |
| FAMILY.md | Visual parentage and inheritance rules |
| TEAM.md | Role composition, responsibility, handoffs, review ownership, escalation |
| PLAYBOOK.md | Trigger, ordered stages, inputs, outputs, checks, termination, recovery |
| CONNECTOR.md | Capability interface, scope, auth owner, availability evidence, effect class, revocation and recovery |

AGENTS.md remains the repository's instruction entry point. AGENT.md is a role recipe. Treat narrative content as lower-trust input within the host's instruction hierarchy. Values can constrain behavior; no sentence in SOUL.md, a character story, or a model response can grant access.

The machine-readable frontmatter uses JSON inside `---` fences, a YAML-compatible subset. The compiler validates references and emits a read projection; it does not execute skills, connectors, or agents. Edit source contracts, then regenerate `catalog.json`; do not maintain a second catalog by hand.

Translate values into observable choices. Under uncertainty, Helix preserves the source and marks the gap; under time pressure, Orin narrows the review and declares its limits; when a user dismisses Coralie, the workflow continues without companion presence. PERSONALITY.md can vary sentence length, warmth, and initiative while the role's authority, evidence requirements, and memory scope remain fixed.

## Standards map

| Concern | Interchange or governing contract | Adapter responsibility |
| --- | --- | --- |
| Plugin distribution | Agent Plugins 1.0 portable manifest | Root plugin.json; discover skills at their fixed path; declare only real MCP bindings |
| Reusable instructions | Agent Skills SKILL.md format | Portable trigger metadata and referenced supporting files |
| Tools and context | MCP, pinned to the target host's supported version | Discover actual tools/resources, validate schemas, authenticate, enforce scopes |
| Design tokens | DTCG 2025.10 format where supported | Translate explicit token values/aliases into Figma variables and application CSS |
| Character and role composition | This package's local contracts | Validate IDs, relationships, evidence state, and output projection |
| Product design adoption | Existing `starlight.design_contract.v1` | Pin the owning brand pack, source hashes, surfaces, and release evidence |
| Runtime and permission state | Owning product's server contracts | Enforce tenant membership, grants, event ordering, cancellation, and revocation |

Sources: [Agent Plugins schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json), [Agent Skills](https://agentskills.io/specification), [MCP](https://modelcontextprotocol.io/specification/latest), [DTCG](https://www.designtokens.org/tr/2025.10/format/). DTCG is a Community Group specification, not a W3C Recommendation. Pin and recheck implementation-sensitive versions; this table does not certify client support.

## Existing infrastructure and ownership

The reviewed portfolio Registry was read at `d98f814ccafe8b6ab4d87d42360a78a07bf4d41b`. The design repository baseline was `851a11be31a0640df64baabcf2b1fc1afb9ce849`. The Registry's former `frankxai/starlight-design-intelligence` path resolves to the transferred repository `Starlight-Intelligence/starlight-design-intelligence`; this package preserves the existing repository identity.

| Layer | Existing owner or adapter | Scope of this release |
| --- | --- | --- |
| Portfolio authority | agentic-ops reviewed Registry | Source/placement reference; no replacement Registry |
| Design source | starlight-design-intelligence | Character design contracts, workflow skills, inspectable plugin package |
| Shared portable capabilities | starlight-agent-skills | Related capability owner; this release does not create or claim a synchronized mirror |
| Product experience | Existing Starlight app and Capability Foundry | Proposed consumer of the compiled design projection |
| Web host | Vercel project `starlightintelligence-ai`, Next.js observed | Project inventory verified; no character integration or deployment proved |
| Stateful execution | Existing Cloudflare Workers including `starlight-cloud-worker`, `starlight-execution-dev`, `starlight-fleet-ingress` | Inventory observed; no behavior or exact binding inferred from names |
| Design workspace | Existing Observatory Figma kit supplied as an export | Export inspected; no live Figma write or published library claimed |
| Inverso | Unresolved product identity | No adapter, endpoint, or connection invented |

Apply accepted boundaries: Git owns versioned definitions; Vercel is the default web experience; Cloudflare Agents/Durable Objects serve persistent addressable entities when justified; one workflow has one durable orchestrator. Supabase holds business and asset metadata. Vercel Blob/Image are the default new web media path; R2/Images/Stream need the recorded workload exception. Drive holds evidence and private masters. The plugin adds no new runtime, backend, store, or scheduled job.

## Concrete integration flow

1. Author the five character/role files and shared family/team/playbook/connector definitions in Git.
2. Validate and compile a versioned catalog with source hashes. Export only the audience-authorized subset.
3. Import that projection into the existing app as data. Resolve asset renditions through approved media records; preserve family/character IDs in Figma components and code.
4. Join a role to a tenant-scoped runtime instance server-side. Map actual runtime events to the UI; do not manufacture state from the catalog.
5. Render a role card, team list, inspector, and result/receipt view from the same IDs. Keep attribution and source inspection available.
6. Release through the product's existing gates, then record the exact integration and runtime observations separately from package checks.

Proposed event fields include schema version, tenant scope, agent ID, run ID, event ID, monotonic sequence, occurred/observed timestamps, state, artifact references, and receipt references. These are adapter requirements, not a live endpoint. Validate events at the server boundary, reject unauthorized scope, and deduplicate by run/event identity. A disconnected or stale stream becomes `unknown`; silence is not success.

## Local compiler

From the plugin directory:

```bash
node scripts/living-design.mjs validate
node scripts/living-design.mjs inspect candidate.nacre
node scripts/living-design.mjs build --out /absolute/new-output-directory
```

An explicit bundle directory may be passed after `validate` or `build`, or after the character ID for `inspect`. Use a new output directory and retain the receipt. The sample agent IDs are role recipes with no runtime binding. Inspecting or compiling them does not register them.
