# Brand adapters for Living Design

Living Design shares component behavior and semantic interfaces. Each brand
retains its own color, type, composition, imagery and motion authority. These
mappings guide an implementation candidate; they do not change an accepted
identity, downstream token pin or deployed product.

## Shared contract

| Semantic role | Living Library variable | Constraint |
| --- | --- | --- |
| Page canvas | `--sl-bg` | Stable reading background. |
| Raised surface | `--sl-panel` | Opaque default for sustained reading. |
| Primary text | `--sl-text` | Validate on both canvas and raised surface. |
| Secondary text | `--sl-muted` | Preserve readable contrast; do not derive from opacity without testing. |
| Boundary | `--sl-line` | Check non-text contrast where a boundary identifies a control. |
| Primary action | `--sl-accent` | Pair with a tested `--sl-accent-ink` value. |
| Action foreground | `--sl-accent-ink` | Never assume white works on a luminous accent. |
| Success / danger | `--sl-success` / `--sl-danger` | Always accompany state color with text or another discernible cue. |
| Glass fill | `--sl-glass` | Keep text readable against the actual composited backdrop. |
| Type roles | `--sl-font-sans`, `--sl-font-serif`, `--sl-font-mono` | Exact files, weights, licenses and computed font evidence remain application responsibilities. |

Share navigation behavior, focus handling, layout primitives, spacing semantics,
form errors, data-table behavior and explicit agent states. Keep palette and
type projections application-owned. Do not import the token sheets from both
`packages/materials` and this library into the same scope; they overlap in the
`--sl-*` namespace. The
[materials integration matrix](MATERIALS-INTEGRATION.md) defines the existing
production-candidate boundary.

## Starlight

Use Operator mode for console, assistant and evidence workflows. The current
library's candidate Midnight and Daylight mappings are:

| Role | Midnight | Daylight |
| --- | --- | --- |
| `--sl-bg` | `#101820` | `#f2f4f1` |
| `--sl-panel` | `#18242d` | `#ffffff` |
| `--sl-text` | `#f0f4f4` | `#182a2b` |
| `--sl-muted` | `#adc0c9` | `#506360` |
| `--sl-line` | `#5c727d` | `#7d918b` |
| `--sl-accent` | `#9bd8cd` | `#164e47` |
| `--sl-accent-ink` | `#102621` | `#ffffff` |

Instrument Sans serves controls and reading; Instrument Serif is a restrained
editorial accent; IBM Plex Mono serves code and aligned data. Glass frames
context while opaque surfaces carry long reading. Unknown agent state remains
unknown until a runtime supplies evidence.

These themes are distinct from the lab's Horizon reference: ink `#070a10`, paper
`#efede7`, ivory `#ede6d8`, gold `#c9a15c` and companion cyan `#82d8e6`. Do not
replace the lab, Academy or protocol reading palette with an Operator candidate.
Preserve the recovered four-point star and companion dot, and the retained
protocol variant. Source authority is
[SIS DESIGN](../../../brand-packs/sis/DESIGN.md) and
[SIS identity sources](../../../brand-packs/sis/SOURCE_AUTHORITY.md).

## FrankX

For technical/product surfaces, project the values in
[FrankX DESIGN](../../../brand-packs/frankx/DESIGN.md):

| Application role | Source value | Mapping rule |
| --- | --- | --- |
| Canvas | `#0a0a0b` | `--sl-bg` |
| Surface | `#111113` | `--sl-panel` |
| Raised surface | `#1a1a1f` | Application-local elevation role. |
| Strong boundary | `#2f2f2f` | Candidate `--sl-line`; verify required control contrast. |
| Technical action | `#10b981` | Candidate `--sl-accent`; select a tested action foreground. |
| Data highlight | `#06b6d4` | Application-local data role, not automatic body text. |
| Editorial emphasis | `#f59e0b` | Application-local editorial role. |

Inter and JetBrains Mono are the technical defaults. Select text/muted colors
from the owning product and validate them; the palette above is not a complete
light/dark contrast contract. The older starter `TOKENS.md` differs from
`DESIGN.md` and must not silently override the selected surface mode.
Editorial, partner and personal surfaces may begin with paper, photography or
warm neutrals instead of technical chrome. Keep copy practical and founder-led.

## GenCreator

[Territory B](../../../brand-packs/gencreator/DESIGN.md) is a publishing identity:
paper `#fbf9f5` and ink `#221f1b` carry at least 90% of the composition; spot red
`#c8322a` registers an edition, source or signature once per object.

| Application role | Mapping |
| --- | --- |
| `--sl-bg` | Paper `#fbf9f5`. |
| `--sl-text` | Ink `#221f1b`. |
| Surface / muted / boundary | Derive from the owning product's paper/ink roles, then test; no inferred approved values. |
| Primary action | Prefer a tested ink/paper pair; reserve brand red for its documented spot role. |
| Semantic status | Use separate accessible treatments with explicit labels; brand red alone cannot identify error or approval. |

Instrument Serif serves editorial releases and display; Instrument Sans serves
reading, controls and evidence. Preserve source, review and export distinctions.
The accepted territory does not approve a production wordmark. Migration remains
surface-specific through the owning product's `data-territory="b"` convention.
See [source authority](../../../brand-packs/gencreator/SOURCE_AUTHORITY.md).

## Arcanea

Keep creator-tool chrome restrained and place characters, lore and cinematic
worlds inside the creator's artifact. Preserve the product-resolved canvas;
[Arcanea DESIGN](../../../brand-packs/arcanea/DESIGN.md) records unresolved source
references of `#09090b`, `#0b0e14` and `#05070f`. This adapter selects none of them.

| Application role | Declared source reference | Constraint |
| --- | --- | --- |
| Intelligence accent | Teal `#00bcd4` | Candidate accent/data role; test the paired foreground. |
| Supporting blue | `#0d47a1` | Use only against a tested surrounding surface. |
| Gold emphasis | `#ffd700` | Highlight role, not automatic text on light backgrounds. |
| Aquamarine | `#7fffd4` | Declared additional package token; no new placement approval implied. |

Geist serves interface display and reading; Geist Mono serves code/data;
Instrument Serif is an editorial accent. Confirm available font files and rights
before redistribution. Preserve current identity assets and locked canon;
inconsistent SVG constructions do not establish a replacement vector family.

## Adoption and contrast

The portable system supplies a semantic API, not portfolio adoption. Pin the
selected brand source in the owning implementation and retain its unresolved
decisions. After an override, test normal text at 4.5:1, large text at 3:1 and
essential non-text boundaries/focus at 3:1 against the actual adjacent colors.
Measure glass against composited content as well as opaque fallback. Verify
keyboard focus, forced colors, reduced motion, reduced transparency and mobile
reflow. A source hex value or a copied token table is not rendered contrast proof.

Do not use motion, a portrait or an accent to imply execution, access, approval,
verified research, a wallet signature or successful payment. Those states require
explicit input and evidence from the host application.
