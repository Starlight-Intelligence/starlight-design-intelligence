# GPU surface site prompts

One prompt per site for shaders, liquid-metal marks, glass, and 3D. Each prompt
is pasted into an agent session opened in that site's repository.

The mechanism lives in `claude-skills-library` `packs/web-excellence`: the
`gpu-surface` governor, four recipe skills (`liquid-logo`, `shader-backdrop`,
`liquid-glass`, `r3f-scene`), `material-system`, and two scripts
(`gpu-surface/probe.mjs`, `gpu-surface/export.mjs`). This playbook holds what
is specific to each site: its rules, its current state, and the surface this
kernel recommends.

Status: **proposal**. A site's material is a brand identity decision. Every
prompt below stops at a proposal with rendered examples, and nothing lands in
a site's `design.md` until Frank approves it.

## How these were written

Each site's rules were read from its own files on 2026-11-12 at the commit
listed, and are quoted with line numbers. Dependency state comes from the
pack's `web-steward/peer-check.mjs`. Library costs come from a lab that
installed each library and rendered it in headless Chromium (recorded in the
pack's `SOURCES.md`).

A prompt's quoted lines can go stale. The first step of every prompt is to
re-read the file, and the file wins over this playbook.

## Before any prompt

1. The site repo has the pack at a version that includes the recipe skills:
   `ls .claude/skills/liquid-logo` succeeds. If not, re-run the pack's
   `install.sh <repo> --claude-md` first. That installs the skills, hooks and
   agents, and writes the gate block into `CLAUDE.md` and `AGENTS.md` so a
   session, and a harness that never loads `.claude/skills`, routes shader,
   glass, mark and 3D work to `gpu-surface` without being told. A hand-written
   gate section is kept as it is, and the installer says when it lacks the
   `gpu-surface` paragraph.
2. Work on a branch. Open a draft pull request. The site's own gates decide.

## Summary

| Site | Repo commit | What its rules allow | Recommended |
|---|---|---|---|
| frankx.ai | `5aa442cc0139` | Glass over imagery; gradients only with meaning; one set-piece per page | Fix React peers first. One glass recipe. A liquid-metal mark on one non-home route. No gradient backdrop. |
| starlightintelligence.ai | `e0ac0d5de66b` | Gradients that describe energy, distance, or transition; no floating glass cards | One horizon field on the home stage. Mark in metal as a trial only. |
| arcanea-ai-app | `5dab6d11f33e` | R3F hero moments, gradient mesh hero canvases, one glass recipe | One mesh field on a flagship hero without a canvas. Audit the existing scenes. |
| gencreator.ai | `81d740fd3327` | 3D that does not delay the useful action; liquid glass retired | No new surface. Bring six existing scenes under the scene contract. |
| gencreator-community | `d3e56a057519` | None: gradients, glass grids, and decorative 3D are refused | None. Record it. |
| agenticincome | `b02ba123f142` | 3D only with a product metaphor, fallback, provenance, and budget | None live. Export-only mark still if wanted. |
| agenticpassiveincome | `7c7b6f24798f` | Glass on navigation, one hero proof plane, comparison tables | CSS glass in those three places. Nothing else. |
| realityarchitect | `1b99f3482bc8` | Glass on navigation and one proof plane | CSS glass in those two places. Nothing else. |
| blue-life-commons | `6925f2e20380` | Glass on small source and status controls; WebGL refused | CSS glass on those controls. Nothing else. |
| frankx-palace | `9167938febd2` | The 3D canvas is the product; one glass recipe | Audit the canvas against the scene contract. No additions. |
| ai-music-academy, starlight-swarm | `f38e2e7f35a5`, `f05c3a2a99a3` | No design contract in the repo | Static only until a `design.md` exists. |

Eight of the eleven rows add no new canvas, and six have none at all. That is
the rules doing their job: a surface means something on the few pages that
carry one.

---

## frankx.ai

Repository `frankx.ai-vercel-website`.

```text
Plan the GPU surfaces for this site. Propose; do not build until I approve.

Read first, and quote what you find: taste.md, design.md, CLAUDE.md,
docs/strategy/HOMEPAGE-PRESERVATION-CONTRACT.md. The rules I expect you to
find (verify them, the files win):
- taste.md:48 a gradient frames meaning or it leaves the page
- taste.md:60 no glassmorphism without imagery underneath
- taste.md:185 abstract gradients-as-art are out
- taste.md:133-140 one scroll set-piece per page
- design.md:38 translucent layered surfaces, "modern liquid glass
  sophistication", not decorative blobs

Out of bounds: app/page.tsx and components/home/**. The homepage is not part
of this work.

Step 1, its own pull request, through web-steward: peer-check reported four
unmet peers on 2026-11-12. react and react-dom are 18.3.1; @react-three/fiber
9.8.2 needs >=19 <19.4 and @react-three/drei 10.7.9 needs ^19. Decide with me
whether to move to React 19 or to R3F 8, and do nothing else on 3D until this
is resolved.

Step 2, through material-system: draft the Material block and surface map.
My starting position:
- glass: one recipe (liquid-glass tier one), used only where an image or
  media sits underneath. This is the layer the brand files ask for.
- metal: the mark in liquid metal on one non-home route where the brand is
  the subject. Trial it in app/design-lab first. Header and footer get the
  exported still, never a canvas.
- field: none. taste.md:185 decides it.
- depth: no new scene.

Step 3: run gpu-surface/probe.mjs on each route that renders
components/mind/MindLatticeScene.tsx, components/ai-architecture/Hero3D.tsx,
and app/golden-age/components/Book3D.tsx. Report the failures as a work list
against r3f-scene section 3. Do not restyle them.

Deliver: the Material block and surface map as a proposal, three exported
stills of the mark at different frames in warm and neutral tints, the probe
reports, and the open decision on React. Then stop.
```

## starlightintelligence.ai

Repository `starlightintelligence.ai`. The pack was not installed there on
2026-11-12; install it first.

```text
Plan the GPU surfaces for this site. Propose; do not build until I approve.

Read first: AGENTS.md, CLAUDE.md, .starlight/voice/context.md, the design/
directory, and the brand pack starlight-design-intelligence/brand-packs/sis
(DESIGN.md, MOTION.md, REFERENCE-LOCK-SI-HOME-2026-11.md, site-tokens). Rules
I expect you to find (verify them, the files win):
- sis/DESIGN.md:53 gradients describe energy, distance, or transition and
  never serve as filler
- sis/DESIGN.md:86 avoid floating glass cards
- sis/DESIGN.md:65 preserve the mark's geometry
- sis/MOTION.md: constellation assembly forms relationships from actual data
- sis/DESIGN.md:103 material foundations (liquid glass, depth, texture) are a
  candidate, not the authority

State today: React 19.3.1, GSAP, no three.js and no shader package.

Through material-system, draft the Material block and surface map. My
starting position:
- field: one shader-backdrop on the home world stage. Its job is the light
  the hero scene describes: distance and arrival, in the site tokens only,
  gold only inside that light. Slow.
- metal: a trial only. Export stills of the mark with contour at 0 and at
  0.2 so its geometry holds, and show me both beside the flat mark. If the
  geometry reads as changed, the answer is no.
- glass: none as cards. Navigation only if the reference lock already has it.
- depth: none until a route has real relationship data to assemble.

Deliver: the proposal, the home route rendered with the field in motion,
reduced motion, and no GPU (probe --shots), the JavaScript cost against a
route without it, and the two mark stills. Capability copy is not part of
this work. Then stop.
```

## arcanea-ai-app

Repository `arcanea-ai-app`, app at `apps/web`.

```text
Plan the GPU surfaces for apps/web. Propose; do not build until I approve.

Read first: TASTE.md, DESIGN.md, .claude/CLAUDE.md, apps/web/CLAUDE.md. Rules
I expect you to find (verify them, the files win):
- TASTE.md:109-114 React Three Fiber for hero moments, particle systems for
  atmospheric depth, gradient mesh backgrounds for hero canvases
- TASTE.md:43 one glass recipe: bg-white/[0.03] border border-white/[0.06]
  backdrop-blur-sm. Do not introduce another.
- TASTE.md:116-120 one choreographed scroll set-piece per flagship page
- TASTE.md:188 no auto-playing background video
- Palette: Atlantean Teal, Cosmic Blue, Arcanean Gold on #09090b. Purple to
  pink gradients are refused.

State today: React 19.3.1, three 0.186.1, @react-three/fiber 9.8.2, no unmet
peers. Existing canvases: components/roadmap/roadmap-hero.tsx,
components/challenges/arena-orbs.tsx, app/canvas/page.tsx.

Lore, canon, and Guardian names are not part of this work.

Through material-system, draft the Material block and surface map. My
starting position:
- field: one shader-backdrop (MeshGradient) in teal, cosmic blue, and gold
  over #09090b, on one flagship hero that has no canvas today. A page with a
  scroll set-piece does not also get a field.
- metal: the Arcanea mark in liquid metal for one brand moment, gold tint.
  Header and footer get the still.
- glass: the existing recipe, unchanged.
- depth: no new scene. Run gpu-surface/probe.mjs on the routes that render
  roadmap-hero and arena-orbs and report against r3f-scene section 3.

Verify with pnpm build, not a dev server. Deliver the proposal, the probe
reports, and rendered examples in the three probe states. Then stop.
```

## gencreator.ai

Repository `gencreator.ai`.

```text
Audit the existing 3D on this site. Add no new surface.

Read first: taste.md, design.md, CLAUDE.md, AGENTS.md. Rules I expect you to
find (verify them, the files win):
- taste.md:32 no huge 3D objects that delay or obscure the useful action
- taste.md:33 no gradients used as content, no glass without a layer to clarify
- design.md:43 liquid glass belongs to the retired system and does not ship
- design.md:42 texture is a tuned feTurbulence at 6% opacity or less on paper
  surfaces, never behind text
- design.md:99 the useful artifact is visible before expensive 3D or media loads

State today: React 19.3.1, three 0.187.0, @react-three/fiber 9.8.2, no unmet
peers. Six scene components under app/components/three/: SourceConstellation,
SubstrateConstellation, VaultCrystal, PillarResonanceRing, GenerativeMesh,
StackLattice.

For each route that renders one of them:
1. Run gpu-surface/probe.mjs with a baseline route that has no scene.
2. Check the component against r3f-scene section 3: is three imported
   outside one leaf, does the loop stop off-screen, is there a reduced-motion
   branch at a chosen moment, is there a poster.
3. Confirm the primary action is usable before the scene loads.

Do not install @shadergradient/react: at 2.4.20 it fails against three
0.187.0. Do not add a shader backdrop or glass; the files above refuse both.

Deliver a table: route, component, probe result, JavaScript cost, contract
gaps, and the smallest fix for each. Fix nothing in this pass. Then stop.
```

## gencreator-community

Repository `gencreator-community`.

```text
Record this site's material as none.

Read taste.md, design.md, and AGENTS.md. taste.md:20 refuses SaaS gradient
cliches, glass-card grids, novelty motion, and decorative 3D (verify it, the
file wins). The page's work is browser-local packet processing.

Through material-system, write the Material block with every layer set to
none and a surface map with one row: every route, none, with the taste.md
line as the reason. Confirm no canvas exists:
grep -rnE "<Canvas|ShaderMount|@paper-design/shaders|@react-three/fiber" app components

Propose the block as a pull request for my approval. Add no dependency.
```

## agenticincome

Repository `agenticincome`.

```text
Record this site's material. I expect it to be none on every route.

Read TASTE.md, DESIGN.md, and CLAUDE.md. Rules I expect you to find (verify
them, the files win):
- TASTE.md:15 no generic AI gradients, decorative node clouds, or fake dashboards
- TASTE.md:17 no 3D or video without a product metaphor, fallback,
  provenance, and performance budget
- DESIGN.md:12 emerald is for verified states and primary actions; never
  flood section backgrounds with gradients
- DESIGN.md:21 no 3D mockups; use the SVG schematic plates and live file-tree
  inspectors

Through material-system, draft the Material block (all none) and the surface
map. If you believe one route has a product metaphor that needs depth, name
the route, the metaphor, the fallback, and the budget in one paragraph, and
build nothing.

Optional, export only: render the mark through liquid-logo on a scratch route
that is not linked or deployed, export one still for social cards, and show
it to me beside the flat mark. No live canvas ships. Income and earnings copy
is not part of this work.
```

## agenticpassiveincome

Repository `agenticpassiveincome`.

```text
Bring this site's glass under one recipe. No canvas.

Read TASTE.md and DESIGN.md. Rules I expect you to find (verify them, the
files win):
- DESIGN.md:22 solid editorial surfaces first; glass is limited to
  navigation, one hero proof plane, and comparison tables
- TASTE.md:19 no decorative glass stacks
- DESIGN.md:29 no generic node or orbit art, no unexplained 3D

Through liquid-glass, tier one only:
1. List every element that uses backdrop-filter today.
2. Propose one GlassPanel recipe from the site's tokens, with the opaque
   fallback and the prefers-reduced-transparency rule.
3. Apply it to the three permitted places and return every other glass
   element to a solid surface.

Through material-system, record field, metal, and depth as none.

Deliver before and after shots at 375, 768, and 1440, one shot with reduced
transparency on, and the contrast of text on each glass panel. Draft pull
request; then stop.
```

## realityarchitect

Repository `realityarchitect`.

```text
Bring this site's glass under one recipe. No canvas.

Read TASTE.md and DESIGN.md. Rules I expect you to find (verify them, the
files win):
- DESIGN.md:17 glass on navigation and one proof plane only; body content
  stays on solid surfaces
- DESIGN.md:29 the named motion is blueprint-resolve: opacity and transform,
  once, static under reduced motion
- The identity is blueprint and graphite for structure, the dawn register
  for the person's own words

Through liquid-glass, tier one only: one GlassPanel recipe from the site's
tokens, applied to the navigation and the one proof plane. Everything else
is solid.

Through material-system, record field, metal, and depth as none. A moving
backdrop would compete with blueprint-resolve, which is the one motion this
site has.

Deliver before and after shots at 375, 768, and 1440, one with reduced
transparency on, and text contrast on both panels. Draft pull request; then
stop.
```

## blue-life-commons

Repository `blue-life-commons`.

```text
Record this site's material. No canvas: the design file refuses WebGL.

Read TASTE.md and DESIGN.md. Rules I expect you to find (verify them, the
files win):
- DESIGN.md:22 "No ambient animal motion, scroll trapping, or WebGL is justified."
- DESIGN.md:18 glass is limited to small source and status controls over media
- TASTE.md: real animals at ethical distance, with rights and credit; no
  generated wildlife presented as evidence

Through material-system, write the Material block with field, metal, and
depth set to none, quoting DESIGN.md:22 as the reason.

Through liquid-glass, tier one only: one recipe for the source and status
controls that sit over media. Check text contrast against the brightest
approved image they can sit on, and confirm the control never covers a
credit or a rights line.

Deliver the block and before and after shots of one media page. Draft pull
request; then stop.
```

## frankx-palace

Repository `frankx-palace`.

```text
Audit the palace canvas against the scene contract. Add nothing.

Read DESIGN.md. Rules I expect you to find (verify them, the file wins):
- DESIGN.md:29-30 one glass recipe: rgba(255,255,255,.03), hairline border,
  backdrop-filter blur(12px), 16px radius. Do not roll a new opacity.
- DESIGN.md:41 reduced motion leaves the palace fully usable; every action is
  reachable by keyboard

State today: Next 15.5.26, React 19.2.7, three 0.171.0, @react-three/fiber
9.6.1, postprocessing, no unmet peers. The canvas is the product:
components/PalaceCanvas.tsx, Room.tsx, Rig.tsx, Motes.tsx.

1. Run gpu-surface/probe.mjs on the palace route. Report all five checks and
   the JavaScript transferred.
2. Check the canvas against r3f-scene section 3 and section 5: device pixel
   ratio ceiling, a loop that stops when the tab or the canvas is not
   visible, a reduced-motion state at a chosen moment, a poster for no WebGL.
3. Measure what postprocessing costs: probe with it on and off.

three is 16 minor versions behind; that is a web-steward upgrade with its own
proof, not part of this audit.

Deliver the probe reports and a work list ordered by what a phone feels
first. Fix nothing in this pass. Then stop.
```

## Sites without a design contract

Repositories `ai-music-academy` and `starlight-swarm` had no `design.md` or
`taste.md` on 2026-11-12.

```text
This repo has no design.md or taste.md, so nothing here can say whether a
shader, glass, or 3D surface belongs.

Do not add one. Confirm there is no canvas today:
grep -rnE "<Canvas|ShaderMount|@paper-design/shaders|@react-three/fiber" app components

Then tell me, in a short list, what a design.md for this site would need to
decide before any surface could be proposed: the tokens, the one job a
surface could have, and what the taste file should refuse. Write nothing to
the repo.
```

## After a proposal is approved

One surface per pull request, in the order `material-system` section 5 gives:
peers, the block and map, the highest-value surface through its recipe, the
probe and the proof, the export. The exported still and loop go through this
repository's generated asset gate before they are published.
