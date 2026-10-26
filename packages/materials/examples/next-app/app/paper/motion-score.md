# Motion score: /paper

Route: `app/paper/page.tsx`. Engine: CSS transitions only. No client island, no library.

| Beat | Trigger | What moves | Property | Duration, easing | Reduced motion |
|---|---|---|---|---|---|
| Page paints | first paint, no script | nothing; the route is static markup on paper | none | none | same still |
| Card press | `:active` on the one interactive card | the card sinks 1px and scales to 0.985 | transform | 120ms, ease-out | transform dropped; the surface still drops from ivory to paper |
| Card hover | fine pointer over the interactive card | the surface drops from ivory to paper | background-color | 120ms, ease-out | unchanged; it is not motion |
| Static cards | pointer over the two static cards | nothing; a surface that reacts and does nothing is a lie | none | none | n/a |
| Button press | `:active` on paper or ink button | sinks 1px, scales to 0.985 | transform | 120ms, ease-out | transform dropped; tint change stays |
| Button hover | fine pointer over a button | paper drops to ivory; ink gains a hairline | background-color, border-color | 120ms, ease-out | unchanged |
| Disabled | always | nothing; half opacity, no pointer events, so no hover and no press | none | none | n/a |
| Focus ring | `:focus-visible` | a 2px gold ring at 3px offset | outline | instant | instant |

Budget: zero GPU surfaces, zero script. If this route ever needs a timeline, it brings its own score first.
