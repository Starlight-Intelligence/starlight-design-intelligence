#!/usr/bin/env node
// Validates a dated creative-brief batch (briefs/<date>/<brand>.json).
// Usage: node scripts/validate-creative-briefs.mjs [briefs/2026-11-27] [--expect-total 100] [--checkouts /home/user]
// --checkouts: directory holding sibling repo checkouts; when given, every style_ref must exist on disk.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const dir = resolve(positional[0] ?? 'briefs/2026-11-27');
const expectTotal = flag('--expect-total') ? Number(flag('--expect-total')) : undefined;
const checkouts = flag('--checkouts');

const KEYS = ['id', 'brand', 'destination', 'audience', 'purpose', 'aspect', 'style_refs', 'prompt', 'negative', 'candidates', 'tier'];
const DEST_KEYS = ['repo', 'route', 'placement'];
const ASPECTS = new Set(['1:1', '16:9', '4:5', '9:16']);
const BRANDS = new Set(['frankx', 'starlight', 'arcanea', 'gencreator', 'agentic-income', 'reality-architect']);

const errors = [];
const err = (file, i, msg) => errors.push(`${file}[${i}]: ${msg}`);
const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const sameKeys = (obj, keys) => {
  const k = Object.keys(obj).sort();
  const want = [...keys].sort();
  return k.length === want.length && k.every((x, j) => x === want[j]);
};

const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) errors.push(`no brief files in ${dir}`);
const ids = new Set();
const counts = {};
let total = 0;

for (const file of files) {
  const brandFromFile = basename(file, '.json');
  let data;
  try {
    data = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  } catch (e) {
    errors.push(`${file}: does not parse: ${e.message}`);
    continue;
  }
  if (!Array.isArray(data)) {
    errors.push(`${file}: top level must be an array`);
    continue;
  }
  if (!BRANDS.has(brandFromFile)) errors.push(`${file}: unknown brand file name`);
  counts[brandFromFile] = data.length;
  total += data.length;

  data.forEach((b, i) => {
    if (b === null || typeof b !== 'object' || Array.isArray(b)) return err(file, i, 'brief must be an object');
    if (!sameKeys(b, KEYS)) err(file, i, `keys must be exactly ${KEYS.join(',')}; got ${Object.keys(b).join(',')}`);
    if (!nonEmpty(b.id)) err(file, i, 'id must be a non-empty string');
    else if (ids.has(b.id)) err(file, i, `duplicate id ${b.id}`);
    else ids.add(b.id);
    if (b.brand !== brandFromFile) err(file, i, `brand "${b.brand}" must equal file brand "${brandFromFile}"`);
    const d = b.destination;
    if (!d || typeof d !== 'object' || Array.isArray(d) || !sameKeys(d, DEST_KEYS)) err(file, i, `destination must be {${DEST_KEYS.join(',')}}`);
    else {
      for (const k of DEST_KEYS) if (!nonEmpty(d[k])) err(file, i, `destination.${k} must be a non-empty string`);
      if (nonEmpty(d.repo) && !/^[\w.-]+\/[\w.-]+$/.test(d.repo)) err(file, i, `destination.repo must be owner/name`);
      if (nonEmpty(d.route) && !d.route.startsWith('/')) err(file, i, 'destination.route must start with /');
    }
    for (const k of ['audience', 'purpose', 'prompt', 'negative']) if (!nonEmpty(b[k])) err(file, i, `${k} must be a non-empty string`);
    if (nonEmpty(b.prompt) && b.prompt.length < 200) err(file, i, 'prompt is too thin (<200 chars)');
    if (nonEmpty(b.negative) && b.negative.length < 80) err(file, i, 'negative is too thin (<80 chars)');
    if (!ASPECTS.has(b.aspect)) err(file, i, `aspect must be one of ${[...ASPECTS].join(' ')}`);
    if (!Array.isArray(b.style_refs) || !b.style_refs.every(nonEmpty)) err(file, i, 'style_refs must be an array of strings');
    else if (checkouts) {
      for (const ref of b.style_refs) {
        // Format: <owner>/<repo>:<path>; the checkout directory is named after <repo>.
        const m = /^([\w.-]+)\/([\w.-]+):(.+)$/.exec(ref);
        if (!m) err(file, i, `style_ref "${ref}" must be owner/repo:path`);
        else if (!existsSync(join(checkouts, m[2], m[3]))) err(file, i, `style_ref missing on disk: ${ref}`);
      }
    }
    if (!Number.isInteger(b.candidates) || b.candidates < 1 || b.candidates > 4) err(file, i, 'candidates must be an integer 1..4');
    if (b.tier !== 'explore') err(file, i, "tier must be 'explore'");
  });
}

if (expectTotal !== undefined && total !== expectTotal) errors.push(`total briefs ${total} != expected ${expectTotal}`);

console.log(JSON.stringify({ dir, counts, total }, null, 2));
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n` + errors.join('\n'));
  process.exit(1);
}
console.log('OK: all brief files parse and match the shape.');
