// Re-embeds each source file into the built shadcn registry payloads under public/r.
// `shadcn build` copies file content verbatim, so a payload whose embedded content differs
// from its source is stale: registry installs would get the old file while workspace
// installs get the new one. `--check` reports drift and exits 1 instead of writing.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'r');

export function registryDrift() {
  const drift = [];
  for (const name of readdirSync(outDir).filter((f) => f.endsWith('.json') && f !== 'registry.json')) {
    const item = JSON.parse(readFileSync(join(outDir, name), 'utf8'));
    for (const file of item.files ?? []) {
      const source = readFileSync(join(root, file.path), 'utf8').replace(/\r\n/g, '\n');
      if (source !== file.content) drift.push({ payload: name, path: file.path, item, file, source });
    }
  }
  return drift;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const drift = registryDrift();
  if (process.argv.includes('--check')) {
    for (const d of drift) console.error(`stale registry payload: public/r/${d.payload} embeds an old ${d.path}`);
    process.exit(drift.length ? 1 : 0);
  }
  const touched = new Map();
  for (const d of drift) {
    d.file.content = d.source;
    touched.set(d.payload, d.item);
  }
  for (const [name, item] of touched) writeFileSync(join(outDir, name), JSON.stringify(item, null, 2));
  console.log(`re-embedded ${drift.length} file(s) in ${touched.size} payload(s)`);
}
