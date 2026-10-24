#!/usr/bin/env node
// Draws the example poster procedurally, with no model and no dependency: a night studio
// seen through a window, ink at the top, a warm lamp glow low left, a cold companion glow
// right, a horizon band, and fine grain so the glass has something to frost. Writes
// public/poster.png and its .vis.provenance.json sidecar, and appends one row to the estate
// image ledger when it is present on this machine.
//
//   node scripts/make-poster.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1440;
const H = 900;
const SEED = 20261020;
const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../public/poster.png');

// DESIGN.md tokens, as numbers (0..1) so the shader's darkening and the poster agree.
const ink = [0x07, 0x0a, 0x10].map((c) => c / 255);
const gold = [0xc9, 0xa1, 0x5c].map((c) => c / 255);
const goldBright = [0xf0, 0xc8, 0x7e].map((c) => c / 255);
const companion = [0x82, 0xd8, 0xe6].map((c) => c / 255);
const ivory = [0xed, 0xe6, 0xd8].map((c) => c / 255);

// Deterministic grain: a small LCG, so the poster is byte-identical on every run.
let s = SEED;
const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const glow = (x, y, cx, cy, r) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0; // filter: none
  const v = y / H;
  for (let x = 0; x < W; x++) {
    const u = x / W;
    // Sky: ink lifting slightly toward a horizon band at 62% height.
    let c = mix(ink, mix(ink, companion, 0.08), clamp01((v - 0.2) / 0.5));
    const horizon = Math.exp(-((v - 0.62) ** 2) / (2 * 0.035 ** 2));
    c = mix(c, mix(gold, ivory, 0.35), horizon * 0.55);
    // Lamp, low left; companion, upper right; a faint second lamp on the desk.
    c = mix(c, goldBright, glow(u, v, 0.18, 0.78, 0.16) * 0.85);
    c = mix(c, gold, glow(u, v, 0.26, 0.9, 0.3) * 0.35);
    c = mix(c, companion, glow(u, v, 0.86, 0.22, 0.2) * 0.45);
    // Desk edge: a dark plane from 72% down with a lit rim.
    if (v > 0.72) c = mix(c, ink, 0.55 + (v - 0.72) * 0.8);
    c = mix(c, goldBright, Math.exp(-((v - 0.72) ** 2) / (2 * 0.004 ** 2)) * 0.25 * (1 - Math.abs(u - 0.35) * 1.2));
    // Window mullions: two thin ink lines so the refraction at the bevel has edges to bend.
    for (const mx of [0.5, 0.74]) if (Math.abs(u - mx) < 0.004 && v < 0.72) c = mix(c, ink, 0.8);
    // Grain.
    const g = 0; rand();
    const i = y * (W * 3 + 1) + 1 + x * 3;
    raw[i] = Math.round(clamp01(c[0] + g) * 255);
    raw[i + 1] = Math.round(clamp01(c[1] + g) * 255);
    raw[i + 2] = Math.round(clamp01(c[2] + g) * 255);
  }
}

// Minimal PNG writer: signature, IHDR, one IDAT, IEND.
const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: RGB
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);

const sidecar = {
  $schema: 'https://frankx.ai/schemas/vis-provenance-sidecar.schema.json',
  asset: 'poster.png',
  created_at: new Date().toISOString(),
  brand: 'starlight',
  prompt: 'Procedural night studio window: ink sky lifting toward a gold horizon band, warm lamp low left, companion-cyan glow upper right, dark desk plane with a lit rim, two mullions. No grain, so the PNG stays small; the shader frosts it. Drawn from DESIGN.md tokens.',
  negative_prompt: null,
  model: 'procedural',
  provider: 'node (scripts/make-poster.mjs)',
  seed: SEED,
  settings: { width: W, height: H, format: 'png', colour_type: 'rgb', grain: 0 },
  agent: { coding_agent: 'Claude Fable 5.1 (Claude Code)', session_ref: 'claude-skills-library#76 materials package' },
  evaluation: 'Example poster for the glass route; not a brand asset. Reviewed by eye in the example app.',
  rights_status: 'generated-owned',
};
writeFileSync(`${out}.vis.provenance.json`, JSON.stringify(sidecar, null, 2) + '\n');

const ledger = 'C:/Users/frank/starlight/logs/image-generation-ledger.jsonl';
if (existsSync(dirname(ledger))) {
  appendFileSync(ledger, JSON.stringify({ ...sidecar, image_path: out }) + '\n');
}
console.log(`${out}: ${W}x${H}, ${png.length} bytes`);
