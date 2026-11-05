// The tokens live in DESIGN.md; tokens.css and theme.css are generated from it by
// `pnpm tokens`. This module names the CSS custom properties so TypeScript can refer to a
// token without typing its value.
export const token = {
  color: (name: string) => `var(--sl-color-${name})`,
  spacing: (name: string) => `var(--sl-spacing-${name})`,
  rounded: (name: string) => `var(--sl-rounded-${name})`,
} as const;
