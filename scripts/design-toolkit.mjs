import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const routes = Object.freeze({
  all: 'skills/design-orchestrator/SKILL.md',
  taste: 'skills/taste-studio/SKILL.md',
  impeccable: 'skills/impeccable-studio/SKILL.md',
  browser: 'skills/browser-verify/SKILL.md',
  references: 'skills/design-reference-selector/SKILL.md',
  threejs: 'skills/image-to-threejs/SKILL.md'
});
const hash = data => createHash('sha256').update(data).digest('hex');

export function verifySources(base = root) {
  const lock = JSON.parse(readFileSync(join(base, 'vendor/source-lock.json'), 'utf8'));
  const failures = [], declared = new Set(['vendor/source-lock.json']);
  const counts = new Map();
  if (lock.schema !== 'starlight.design_skill_sources.v1' || lock.sources.length !== 6) failures.push('invalid source lock shape');
  for (const source of lock.sources) {
    if (!/^[a-f0-9]{40}$/.test(source.commit)) failures.push(`${source.id}: mutable source revision`);
    if (!['MIT', 'Apache-2.0'].includes(source.license)) failures.push(`${source.id}: unreviewed license`);
    const prefix = `vendor/${source.id}/`;
    for (const file of source.files) {
      if (!file.path.startsWith(prefix) || file.path.split('/').some(p => ['..', '.', ''].includes(p)) || declared.has(file.path)) {
        failures.push(`unsafe or duplicate source path: ${file.path}`); continue;
      }
      declared.add(file.path);
      const absolute = join(base, file.path);
      try {
        const rel = relative(realpathSync(base), realpathSync(absolute));
        let cursor = absolute;
        while (cursor !== resolve(base) && cursor.startsWith(resolve(base) + sep)) {
          if (lstatSync(cursor).isSymbolicLink()) throw new Error('symlink');
          cursor = dirname(cursor);
        }
        if (rel.startsWith('..') || lstatSync(absolute).isSymbolicLink() || !lstatSync(absolute).isFile()) throw new Error('escaped or nonregular source');
        const bytes = readFileSync(absolute);
        if (bytes.length !== file.bytes || hash(bytes) !== file.sha256) failures.push(`${file.path}: source bytes differ`);
      } catch (e) { failures.push(`${file.path}: ${e.message}`); }
    }
    if (!declared.has(`${prefix}LICENSE`)) failures.push(`${source.id}: license missing`);
    counts.set(source.id, source.files.length);
  }
  if (!declared.has('vendor/impeccable/NOTICE.md')) failures.push('Impeccable NOTICE missing');
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name), local = relative(base, path).split(sep).join('/');
      if (entry.isDirectory()) walk(path);
      else if (!declared.has(local) || entry.isSymbolicLink()) failures.push(`unlocked vendor file: ${local}`);
    }
  }
  walk(join(base, 'vendor'));
  return {valid: failures.length === 0, failures, sources: Object.fromEntries(counts)};
}

export function doctor(base = root) {
  const check = command => {
    const result = spawnSync(command, ['--version'], {encoding: 'utf8', timeout: 5000});
    return {available: !result.error && result.status === 0, version: (result.stdout || result.stderr || '').trim().slice(0, 160)};
  };
  return {
    node: {available: Number(process.versions.node.split('.')[0]) >= 22, version: process.version},
    python3: check('python3'),
    playwright_cli: check('playwright-cli'),
    browser_runtime: {status: 'unverified', reason: 'CLI presence is not a browser launch or rendered check'},
    impeccable_engine: {status: 'unverified', reason: 'launcher is bundled; no engine download or hook installation is performed'},
    procedural_mesh_export: {available: existsSync(join(base, 'vendor/img2threejs/runtime/scripts/export_mesh_geometry.mjs')), reason: 'absent in pinned upstream base; optional runtime integration remains unresolved'},
    effects: 'read-only capability inspection; no installers, hooks or settings writes'
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command = 'list', stage] = process.argv.slice(2);
  if (command === 'list') console.log(JSON.stringify(routes, null, 2));
  else if (command === 'route' && Object.hasOwn(routes, stage)) console.log(join(root, routes[stage]));
  else if (command === 'verify') {
    const result = verifySources(); console.log(JSON.stringify(result, null, 2)); if (!result.valid) process.exitCode = 1;
  } else if (command === 'doctor') console.log(JSON.stringify(doctor(), null, 2));
  else { console.error('Usage: design-toolkit.mjs list | route <all|taste|impeccable|browser|references|threejs> | verify | doctor'); process.exitCode = 2; }
}
