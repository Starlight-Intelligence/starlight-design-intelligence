# Motion score: /agent

Route: `app/agent/page.tsx`. Engine: CSS transitions only. No client island, no library.

| Beat | Trigger | What moves | Property | Duration, easing | Reduced motion |
|---|---|---|---|---|---|
| Page paints | first paint, no script | nothing; the run is static markup on ink | none | none | same still |
| Step state | server render | nothing; a step's state is an icon, a tone and a word, and none of them animates | none | none | same still |
| Running step | always | nothing; the running icon does not spin. A spinner with no real progress behind it would claim work the page cannot see | none | none | n/a |
| Source press | `:active` on a source chip | the chip sinks 1px and scales to 0.985 | transform | 120ms, ease-out | transform dropped; the surface still darkens |
| Source hover | fine pointer over a source chip | the hairline brightens one step | border-color | 120ms, ease-out | unchanged; it is not motion |
| Button press | `:active` on Approve, Deny or Send | sinks 1px, scales to 0.985 | transform | 120ms, ease-out | transform dropped; tint change stays |
| Citation jump | activate a citation mark | the page scrolls to the source; no smooth scroll is set, so the jump is a cut | scroll position | instant | instant |
| Focus ring | `:focus-visible` on a mark, a chip, a button or the composer | a 2px gold ring at 3px offset; on the composer the ring is drawn on the whole form | outline | instant | instant |

Budget: zero GPU surfaces, zero script.

Not scored because not built: a step entering as a live run streams in. When that exists it needs a client island, a live region announcing `summarizeRun().label`, and its own row here before it ships.
