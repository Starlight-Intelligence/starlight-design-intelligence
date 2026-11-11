# Starlight Living Design

A private, skills-only design plugin. Use it to connect distinctive character systems to inspectable AI product behavior.

Six workflows, twelve candidate character bundles, four visual families, one local catalogue compiler. This package creates no runtime, connector, schedule or background worker.

## Start

Invoke **Design character lineage** for new cast work, **Compose agent identity** for contracts, **Design companion journey** for UI, **Visualize agent team** for capability maps, **Bind character runtime** for infrastructure handoff, or **Review living design** for acceptance.

With Node 22 or newer: `node scripts/living-design.mjs validate`; `node scripts/living-design.mjs inspect candidate.nacre`; `node scripts/living-design.mjs build --out /absolute/new-output-directory`.

Canonical source: the existing Starlight Design Intelligence repository. The account package is a derived private release; proposed characters are not approved brand canon. The `SOUL.md`, `PERSONALITY.md` and other design filenames are Starlight conventions. Only `SKILL.md` and the plugin manifest claim their relevant portable formats.

Public source contains no original private reference artwork. A private build may add source-family images through the documented local build process. No images are published by the CLI.

## Private reference build

Place authorized PNG originals in `assets/living-design/reference-art/`. Add `assets/living-design/private-reference-index.json` containing an array of `{ "slot": "TIDE", "path": "reference-art/prismatic-tide.png", "sha256": "<raw-file-sha256>" }` entries. Supported slots are PORCELAIN, NOBLE, TIDE and GARDEN. The compiler checks file type, hash, size and paths, then embeds unchanged originals in the offline atlas. Without this optional index it shows a clear missing-reference state. Keep these private files out of Git; review audience rights before distributing a derived package.

Repository maintainers edit the canonical `skills/<name>/` sources and run `node scripts/sync-living-design-skills.mjs`. Package copies differ only in relative links to bundled assets.
