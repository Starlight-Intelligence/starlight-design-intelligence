import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { root, verifySources } from './design-toolkit.mjs';

const allowedRoots = new Set(['skills', 'vendor', 'brand-packs', 'evals', 'playbooks', 'schemas', 'scripts', 'brand-image-system', 'portfolio', 'observatory', 'runtime', 'editorial', 'templates', 'docs', 'browser-checks']);
export function included(path) {
  if (path.split('/').some(p => p === '..' || p === '.git' || p === 'node_modules' || p === '__pycache__')) return false;
  if (/\.(?:env|pyc|zip|tar|gz)$/.test(path)) return false;
  return (!path.includes('/') && /\.(?:md|json)$/.test(path)) || allowedRoots.has(path.split('/')[0]);
}
export function validateSkills(files) {
  const failures = [], names = new Set();
  for (const [path, data] of files) {
    if (!/^skills\/[^/]+\/SKILL\.md$/.test(path)) continue;
    const match = data.toString('utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    let meta;
    try { meta = match && parse(match[1]); } catch (e) { failures.push(`${path}: ${e.message}`); continue; }
    const directory = path.split('/')[1];
    if (!meta || meta.name !== directory || !meta.description?.trim() || names.has(meta.name) || data.length > 1048576) failures.push(`${path}: invalid or duplicate skill metadata`);
    names.add(meta?.name);
  }
  return {failures, names: [...names]};
}

export function buildPlugin({out, repoRoot = root}) {
  if (!out || !out.startsWith('/')) throw new Error('--out must be an absolute archive path');
  const output = resolve(out);
  if (output === repoRoot || output.startsWith(resolve(repoRoot) + '/')) throw new Error('archive must be outside the plugin source');
  const git = args => execFileSync('git', ['-C', repoRoot, ...args], {maxBuffer: 32 * 1024 * 1024});
  const revision = git(['rev-parse', 'HEAD']).toString().trim();
  const manifest = JSON.parse(git(['show', `${revision}:plugin.json`]).toString());
  if (manifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' || manifest.name !== 'starlight-design-intelligence') throw new Error('invalid manifest identity');
  const ui = manifest.extensions?.['com.openai']?.interface;
  if (!ui?.shortDescription?.trim() || ui.shortDescription.length > 30 || !Array.isArray(ui.capabilities)) throw new Error('invalid plugin presentation');
  const entries = git(['ls-tree', '-rz', revision]).toString().split('\0').filter(Boolean);
  const files = new Map(), modes = new Map();
  for (const entry of entries) {
    const [meta, path] = entry.split('\t'), [mode, kind] = meta.split(' ');
    if (!included(path)) continue;
    if (!['100644', '100755'].includes(mode) || kind !== 'blob') throw new Error(`nonregular package entry: ${path}`);
    files.set(path, git(['show', `${revision}:${path}`])); modes.set(path, mode);
  }
  const skills = validateSkills(files);
  if (skills.failures.length || !skills.names.includes('design-orchestrator') || skills.names.length !== 22) throw new Error(`portable skill validation: ${skills.failures.join('; ')}; count=${skills.names.length}`);
  const receipt = {
    schema: 'starlight.design_plugin_package.v1', repository: manifest.repository,
    source_revision: revision, version: manifest.version, source_state: 'committed_candidate; reviewed-main and host adoption require separate verification',
    skills: skills.names.sort(),
    files: [...files].map(([path, data]) => ({path, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length, mode: modes.get(path)}))
  };
  files.set('assets/source-receipt.json', Buffer.from(JSON.stringify(receipt, null, 2) + '\n'));
  const temporary = mkdtempSync(join(tmpdir(), 'starlight-design-plugin-'));
  try {
    for (const [path, data] of files) {
      const target = join(temporary, path); mkdirSync(dirname(target), {recursive: true}); writeFileSync(target, data);
    }
    const verification = verifySources(temporary);
    if (!verification.valid) throw new Error(verification.failures.join('; '));
    const archivePlan = {output, directory: temporary, modes: Object.fromEntries(modes)};
    execFileSync('python3', ['-c', `
import json, pathlib, sys, zipfile
p=json.load(sys.stdin)
base=pathlib.Path(p['directory'])
pathlib.Path(p['output']).parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(p['output'], 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in sorted(base.rglob('*')):
        if not f.is_file(): continue
        name=f.relative_to(base).as_posix()
        i=zipfile.ZipInfo(name, date_time=(2026,10,30,0,0,0))
        i.create_system=3
        i.external_attr=(0o100755 if p['modes'].get(name)=='100755' else 0o100644)<<16
        i.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(i, f.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
`], {input: JSON.stringify(archivePlan)});
    const archive = readFileSync(output);
    const summary = {...receipt, archive: {path: output, sha256: createHash('sha256').update(archive).digest('hex'), bytes: archive.length}};
    writeFileSync(`${output}.receipt.json`, JSON.stringify(summary, null, 2) + '\n');
    return {archive: summary.archive, revision, skills: receipt.skills, files: files.size};
  } finally { rmSync(temporary, {recursive: true, force: true}); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--out') throw new Error('Usage: build-design-plugin.mjs --out /absolute/output.zip');
  console.log(JSON.stringify(buildPlugin({out: args[1]}), null, 2));
}
