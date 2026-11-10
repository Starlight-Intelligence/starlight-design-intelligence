# v0 pilot prompt: starlightintelligence.ai home (Horizon)

Use in v0 after **Import from GitHub → `Starlight-Intelligence/starlightintelligence.ai` → existing Vercel project `starlightintelligence-ai`**.
Work on a branch. v0 Publish merges, so open a PR and let pr-gate decide. Production is unchanged until that PR merges.
Relink first: the Vercel project still links to `frankxai/starlightintelligence.ai` (agentic-ops PR #540, runbook §2).

Paste everything below the line into v0.

---

Redesign only the home route of this Next.js app as a Horizon-mode page. Keep every existing route, data source, waitlist and form handler working. Do not add dependencies. Do not touch checkout, auth, API routes or `public/brand/identity.json`.

**Design system (binding):**
- Load `brand-packs/sis/site-tokens/starlightintelligence-home.tokens.css` values as CSS custom properties. Use only those colours. No other hex values.
- Interface stays neutral: ink canvas, ivory text, ivory primary button with dark text, ivory-outline secondary button. Gold (`--si-arrival`) appears only inside the hero scene's light and on at most one human-decision control per fold. Companion cyan appears only for live system state.
- Type: Instrument Serif italic for the one display line per fold; Instrument Sans for everything you read or click; IBM Plex Mono at 12px with 0.08em tracking for small labels like `[ 01 · KERNEL ]`. No condensed or uppercase display type.
- No drop shadows. Separate with tonal steps or 1px `--si-rule` hairlines. Corners: 8px controls, 16px cards, 48px top corners on major bands.
- Buttons are 48px tall. The primary action joins a separate square arrow cell with matching corners.

**Page structure:**
1. **World stage.** Full-bleed scene under a 64px header. Headline left, about three fifths of the width, two lines. Support copy at most 380px wide. Two actions below. The lit focal object sits on the right. Until real art exists, render a placeholder `<figure>` with the correct aspect ratio (16:10 desktop, 4:5 mobile), the ink canvas, and a caption stating the art direction: "A person at the edge of a living intelligence map; warm gold light from the map onto the figure; deep night environment; no stars as wallpaper." Add a left-to-right ink gradient so the copy keeps contrast.
2. **What Starlight does.** A mono label, a chapter heading, and an open ruled list of 3 to 4 capabilities taken from the current page copy. Each has a hairline on top, a title and two lines of text. No filled cards.
3. **Proof.** Only facts already present in the repo's content (Kernel, playbooks, receipts). No invented numbers, logos, testimonials or certifications.
4. **Invitation.** A second scene placeholder with one centred invitation line and the existing waitlist or signal action.
5. **Ending.** Three columns of existing footer links, then a curved newsletter stage (a large dark ellipse over a raised band) if the site already has a newsletter form, then one oversized closing word set as SVG in ivory: "STARLIGHT".

**Quality bar:**
- Mobile first at 390px: the copy moves into the scene's dark area, the focal object stays visible, lists become one column, and nothing scrolls horizontally.
- Accessibility: one h1, real landmarks, visible focus rings in `--si-text`, 44px minimum hit areas, body contrast AA on ink and on paper.
- Performance: no client JS for layout, the hero image (once real) uses `next/image` with `priority`, and fonts use `next/font` with the three families already in the project.
- Respect `prefers-reduced-motion`. Motion is limited to 220ms fades on hover and focus.
- Wire `cta_click` events on both hero actions with `track()` from `@vercel/analytics` if the analytics helper from PR #321 exists in the branch; otherwise leave a typed no-op.

Output: the changed files only, then a short list of what you could not do and why.
