import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()) throw Error('Commit the candidate before source assembly.');
await fs.mkdir(path.join(root, 'release'), { recursive: true });
execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
const packed = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', 'release'], { cwd: root, encoding: 'utf8' }))[0];
for (const file of packed.files) if (!/^(dist\/[A-Za-z-]+\.(js|d\.ts|css)|package\.json|README\.md|THIRD_PARTY_NOTICES\.md|SOURCE-RIGHTS\.md)$/.test(file.path)) throw Error('Unexpected npm package member ' + file.path);
const lock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json'), 'utf8'));
const inventory = [];
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location) continue;
  let metadata = {};
  try { metadata = JSON.parse(await fs.readFile(path.join(root, location, 'package.json'), 'utf8')); } catch { /* optional platform package absent */ }
  inventory.push({ location, name: metadata.name || location.split('node_modules/').at(-1), version: entry.version || metadata.version, license: metadata.license || entry.license || 'UNRESOLVED', development: Boolean(entry.dev), optional: Boolean(entry.optional) });
}
await fs.writeFile(path.join(root, 'release/dependency-inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
const file = path.join(root, 'release', packed.filename);
const bytes = await fs.readFile(file); const digest = createHash('sha256').update(bytes).digest('hex');
const receipt = { schema: 'starlight.agent_package.v1', sourceRevision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), file: packed.filename, bytes: bytes.length, sha256: digest, published: false, license: 'UNLICENSED', checkoutActive: false };
await fs.writeFile(path.join(root, 'release/package-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
execFileSync('python3', ['scripts/assemble.py'], { cwd: root, stdio: 'inherit' });
