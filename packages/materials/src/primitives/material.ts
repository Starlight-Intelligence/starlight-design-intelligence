// The one place a primitive learns what a material looks like and how it behaves under the
// pointer. Button, Card and Sheet import from here; they never carry a colour or a state rule
// of their own. Colours are Tailwind classes over the DESIGN.md tokens (src/tokens/theme.css).

export type Material = 'glass' | 'paper' | 'ink';

export const MATERIALS: readonly Material[] = ['glass', 'paper', 'ink'];

// Surface and text per material. Glass is translucent over a scene and carries the scene
// shadow and the inset bevel highlight; under reduced transparency the CSS in
// src/styles/materials.css swaps it for the opaque designed still.
export const materialSurface: Record<Material, string> = {
  glass:
    'sl-glass bg-glass-tint text-on-surface border border-hairline shadow-[inset_0_1px_0_var(--color-highlight),0_20px_60px_var(--color-glass-tint)]',
  paper: 'bg-surface-paper text-on-paper border border-on-paper/10',
  ink: 'bg-primary text-on-surface border border-hairline',
};

// The state contract, shared by every interactive primitive.
//
// press  : the surface sinks 1px and shrinks under the pointer, 120ms. Tailwind 4 writes
//          translate-* and scale-* to the individual `translate` and `scale` properties,
//          so those are what transition and what materials.css resets to `none` under
//          reduced motion; the tint change below survives there.
// focus  : a 2px gold-bright ring with 3px offset on :focus-visible, on every material.
//          `outline-none` is not used; the ring is the outline.
// hover  : only inside @media (hover: hover) and (pointer: fine), through the `fine-hover`
//          variant materials.css defines. Tailwind's own `hover:` checks (hover: hover)
//          alone, which still fires on a touch screen paired with a stylus.
// disabled: half opacity, no pointer events, so no hover and no press.
export const stateContract =
  'transition-[translate,scale,background-color,border-color,opacity] duration-120 ease-out ' +
  'active:translate-y-px active:scale-[0.985] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

// Hover per material: glass lightens one step, paper drops to ivory, ink gains a hairline.
export const materialHover: Record<Material, string> = {
  glass: 'fine-hover:bg-glass-tint/80 fine-hover:border-highlight',
  paper: 'fine-hover:bg-surface-ivory',
  ink: 'fine-hover:border-highlight',
};

// Press tint per material, so a touch press that never moves still answers.
export const materialActive: Record<Material, string> = {
  glass: 'active:bg-primary/70',
  paper: 'active:bg-surface-ivory',
  ink: 'active:bg-glass-opaque',
};

export function materialClasses(material: Material, interactive: boolean): string {
  return interactive
    ? `${materialSurface[material]} ${stateContract} ${materialHover[material]} ${materialActive[material]}`
    : materialSurface[material];
}
