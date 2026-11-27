# Third-party boundaries

No CopilotKit example application code, branding or media was copied into this add-on. Independently authored Starlight components import published dependencies; those packages are installed separately rather than vendored in the npm archive.

- React/DOM and AG-UI client/core: MIT. Zod: MIT. The optional zod3-compat alias is the unmodified npm zod3.25.76 package required by the experimental A2UI catalog; its dependency advisory remains a production blocker.
- CopilotKit React core and A2UI renderer 1.87.1: manifest MIT; the A2UI-derived implementation retains Google Apache-2.0 headers. Preserve those notices when redistributing its bundled code. The copied CopilotKit/A2UI repository itself is Apache-2.0 and was not vendored here.
- CopilotKit Intelligence and enterprise/managed services have separate commercial terms; neither a permissive SDK manifest nor Starlight's license grants those services. The optional adapter uses a host-supplied runtimeUrl and excludes selfManagedAgents/hosted Intelligence.
- Fontsource Instrument Sans and IBM Plex Mono workbench font files are SIL OFL 1.1. Exact existing font notices are retained in docs/licenses. Instrument Serif notice is retained from the foundation but that font is not bundled by this add-on's demo.
- Vite, TypeScript, Vitest, jsdom, Testing Library, Playwright and axe-core are development/verification dependencies. The generated inventory records installed package versions/licenses; a manifest license identifier is inventory evidence, not legal clearance for every nested asset.

Read the canonical eleven-repository assessment before adopting more examples. Sources with no license are excluded. No paid competitor components are redistributed.
