# Starlight AI experience proposal · 13 November 2026

Status: **review proposal**. No design approval, runtime adoption, production change, mobile release, model availability or paid capability is asserted.

## Decision

Select **Instrument** for the founder workbench: one stable shell, useful work in the center, evidence on demand, and decisions at the point of consequence. Retain the existing four-point mark, ink/ivory/gold identity and interface typography. Preserve the portable workspace and recorded-mission paths during any migration.

Recipient: an AI-native founder or small team carrying an idea from capture to an inspectable artifact. Their recurring job is to resume a project, run a bounded workflow and decide what may happen next. The reason to return is retained project context and work they can inspect and carry forward. This is the intended product thesis, not validated buyer evidence.

Primary outcome: **capture → project → workflow → source-backed artifact → review → export**. General assistant remains a front door to this shared work, rather than a separate history silo.

## Review artifacts

- [Audit and evidence limits](AUDIT.md)
- [Screen-by-screen specification and checklist](SCREENS.md), covering all nine requested flows in eleven screen contracts
- [Components, interaction, accessibility and acceptance](COMPONENTS.md)
- [Machine-readable screen plan](screens.proposal.json)
- [Proposed semantic token aliases](tokens.proposal.json)
- [Proposed cross-platform view models](view-models.proposal.ts), illustrative and not wired to a service
- `boards/`: three distinct direction comparisons and representative desktop, tablet, mobile and extension compositions. These are vector concepts, not screenshots of implemented screens.

The monochrome mark in concept application tiles preserves the exact owned path and companion dot from web `public/brand/starlight-star-monochrome.svg` at the pinned web commit. It is an application of the existing mark, not a new logo.

The accompanying PDF contains all eleven screen concepts, source-screen comparison, state specimens, directions, navigation and release gates. Mockups use Helvetica/Times/Courier as explicit PDF fallback specimens; product targets remain Instrument Sans / Instrument Serif / IBM Plex Mono. They do not prove the intended web fonts rendered.

## Source ownership and change boundary

| Source | Inspected revision / state | Responsibility |
| --- | --- | --- |
| [Web product](https://github.com/Starlight-Intelligence/starlightintelligence.ai/tree/f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab) | `f4e7631e3ba3ceb0b2d7ca0b7cc22f955ee88fab` | existing application, extension, shared run projection and @starlight/ui |
| [Design intelligence](https://github.com/Starlight-Intelligence/starlight-design-intelligence/tree/4426ddc83c4a14238e15b262fb1dfc8d3c018624) | `4426ddc83c4a14238e15b262fb1dfc8d3c018624` | brand authority, candidate materials, design rules and these proposal artifacts |
| [Living Design PR #97](https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/97) | `e48f07f85056b6561fb0f3133365c7088573b16b` · open draft, unmerged | 19 component candidates and bounded Command Center simulation |
| [Interface review PR #89](https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/89) | `8ad838b3690807098daf4cf359d1a26a05bb1086` · open draft | prior competing-interface audit; no supersession approval |

This branch changes only `docs/experience/starlight-ai-20261113/`. It does not modify brand authority, components, routes, styles, dependencies, billing, auth, permissions or deployment configuration. Proposed paths in SCREENS.md are navigation contracts, not evidence of existing routes. Existing /missions and /platform remain the observed available paths.

## Three directions and selection

| Direction | Composition / type / imagery / interaction / motion | Assessment |
| --- | --- | --- |
| Instrument · selected proposal | Ink workbench; narrow rail; artifact and evidence split; interface sans plus short serif accent; small existing Star portraits; contextual inspector; finite state changes | Best fit for doing and reviewing work on all four surfaces. Highest reuse of current operational components. |
| Reading Room | Porcelain two-page reading spread; larger serif titles; no cinematic scene; footnote rail; page-turn-like crossfade replaced by direct change for reduced motion | Strong long-form review; weaker concurrent execution and narrow extension density. Retain as reading mode candidate. |
| Orbit Map | Relationship map dominates; mono event labels and small portrait nodes; focus-to-inspector selection; finite relationship trace | Useful for agent monitoring; poor first-run and phone use, extra graph complexity. Keep as advanced view, not default shell. |

This selects an implementation candidate for review. It does not supersede accepted brand identity or promote candidate living themes.

## Approval sequence

1. Owner accepts Instrument direction, navigation, scope language and proposed token aliases.
2. Implement only the approved subset on an isolated branch in the web repository, extending its existing shared contracts and @starlight/ui. Start with capture/draft preservation, actual-model display and full-scope approval review.
3. Validate the actual preview at 375, 768 and 1440 CSS px, plus 320px reflow, keyboard, touch, assistive technology, preference modes and interrupted journeys. This package does not satisfy those runtime checks.
4. Obtain substantive review from a different provider as required by the web repository. Codex sibling reviews in this task are internal checks and do not satisfy that release requirement.
5. Owner separately approves merge and preview promotion; subscriptions and native releases retain their own gates. No production action is authorized by this document.

Rollback for this documentation-only branch is to close the draft or revert its bounded docs commit. A later runtime migration needs its own compatible rollback and persisted-data plan.
