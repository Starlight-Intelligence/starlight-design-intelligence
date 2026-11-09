# Motion score: /glass

Route: `app/glass/page.tsx`. Engine: CSS transitions and one three.js pass behind the gate. No GSAP, no timeline. Every beat names its reduced-motion state; a beat without one does not ship.

| Beat | Trigger | What moves | Property | Duration, easing | Reduced motion |
|---|---|---|---|---|---|
| Poster paints | first paint, no script | nothing; the `<img>` and the CSS-blurred panel are the still | none | none | same still |
| Canvas reveal | probe passed, first WebGL frame drawn | the canvas fades in over the poster, pixel for pixel | opacity 0 to 1 | 400ms, `cubic-bezier(0.2, 0, 0, 1)` | gate refuses WebGL, so there is no canvas; the still stays |
| Pointer light | mouse moves over the panel | a soft highlight in the shader follows the pointer; the DOM does not move | shader uniform `uLit`, `uPointer` | one frame per pointer event, drawn on change only | gate refuses WebGL; no highlight |
| Bevel refraction | scroll or resize moves the panel over the poster | the refraction at the panel edge re-samples the poster | shader uniform `uRect` | one frame per change | gate refuses WebGL; the CSS blur does not move |
| Button press | `:active` on the glass or ink button | the button sinks 1px and scales to 0.985 | transform | 120ms, ease-out | transform dropped; the tint change stays |
| Button hover | fine pointer over the button | glass lightens one step; ink gains a hairline | background-color, border-color | 120ms, ease-out | unchanged; it is not motion |
| Focus ring | `:focus-visible` | a 2px gold ring appears at 3px offset | outline | instant | instant |
| Off screen | the scene leaves the viewport | drawing stops; the last frame stays on the canvas | none | none | n/a |
| Teardown | preference change, resize under 900px, lost context, failed poster, unmount | the canvas fades out (opacity to 0) and the CSS tier returns | opacity | 400ms | cut, no transition |

Budget: one GPU surface on the route; 12 probe frames under 8ms median or the pass is disposed. Measured value and device are in the pull request.
