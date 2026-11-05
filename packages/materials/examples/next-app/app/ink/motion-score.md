# Motion score: /ink

Route: `app/ink/page.tsx`. Engine: CSS transitions and tw-animate-css keyframes on the sheet (shadcn's `animate-in` / `animate-out`). No GSAP. One client island: the sheet.

| Beat | Trigger | What moves | Property | Duration, easing | Reduced motion |
|---|---|---|---|---|---|
| Page paints | first paint, no script | nothing; the shell is static markup on ink | none | none | same still |
| Sheet opens | trigger pressed | overlay fades in; the sheet slides in from the right edge | opacity (overlay); transform (sheet) | 500ms open, ease-out | cut: `animation: none` on overlay and content; the sheet is simply there |
| Sheet closes | close control, overlay press, Escape | overlay fades out; the sheet slides out to the right | opacity; transform | 300ms close, ease-out | cut |
| Sheet scroll | touch drag inside the sheet | the sheet's own content scrolls; `touch-action: pan-y` on a side sheet, so a horizontal drag is not claimed | scroll | native | native |
| Card press | `:active` on the interactive ink card | sinks 1px, scales to 0.985 | transform | 120ms, ease-out | transform dropped; the hairline change stays |
| Card hover | fine pointer over the interactive card | a hairline appears | border-color | 120ms, ease-out | unchanged |
| Static card | pointer over the command-bar card | nothing | none | none | n/a |
| Button press | `:active` on any button | sinks 1px, scales to 0.985 | transform | 120ms, ease-out | transform dropped; tint change stays |
| Button hover | fine pointer | ink gains a hairline; paper drops to ivory; glass lightens one step | background-color, border-color | 120ms, ease-out | unchanged |
| Focus ring | `:focus-visible` on any control, including the sheet's close | a 2px gold ring at 3px offset | outline | instant | instant |

Budget: zero GPU surfaces. The glass button on this route is the CSS tier only; there is no scene for it to refract, which is the Do's and Don'ts rule about glass over copy made visible.
