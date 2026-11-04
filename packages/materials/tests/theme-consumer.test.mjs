import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const theme = read('src/tokens/theme.css');
const tokens = read('src/tokens/tokens.css');
const styles = read('src/styles/materials.css');
const material = read('src/primitives/material.ts');
const disclosure = read('src/primitives/ui/evidence-disclosure.tsx');
const paperPage = read('examples/next-app/app/paper/page.tsx');
const inkSelector = ':root, [data-theme="ink"], [data-mode="operator"]';

function block(css, selector) {
  const normalize = (value) => value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
  const match = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .find(([, head]) => normalize(head) === normalize(selector));
  assert.ok(match, `missing CSS block ${selector}`);
  return Object.fromEntries(
    [...match[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
  );
}

function resolve(value, variables, seen = new Set()) {
  return value.replace(/var\((--[\w-]+)(?:,\s*[^)]*)?\)/g, (match, name) => {
    assert.ok(variables[name], `missing token ${name}`);
    assert.ok(!seen.has(name), `cyclic token ${name}`);
    return resolve(variables[name], variables, new Set([...seen, name]));
  });
}

function rgb(hex) {
  const match = /^#([\da-f]{6})$/i.exec(hex);
  assert.ok(match, `expected opaque hex color, received ${hex}`);
  return [0, 2, 4].map((index) => {
    const channel = parseInt(match[1].slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
}

function contrast(foreground, background) {
  const luminance = (color) => {
    const [red, green, blue] = rgb(color);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function themeTokens(selector) {
  return {
    ...block(tokens, inkSelector),
    ...block(tokens, selector),
    ...block(tokens, ':root, [data-theme="ink"], [data-theme="paper"], [data-mode="operator"]'),
  };
}

test('Tailwind palette utilities resolve through the unified semantic theme aliases', () => {
  assert.match(theme, /@theme\s+inline\s*\{/);
  const palette = block(theme, '@theme inline');
  for (const name of [
    'primary', 'secondary', 'tertiary', 'neutral', 'surface', 'surface-paper', 'surface-ivory',
    'on-surface', 'on-paper', 'accent', 'accent-bright', 'signal', 'glass-tint',
    'glass-tint-webgl', 'glass-opaque', 'hairline', 'highlight', 'focus', 'error',
  ]) {
    assert.equal(palette[`--color-${name}`], `var(--sl-color-${name})`);
  }

  const paper = themeTokens('[data-theme="paper"]');
  const ink = themeTokens(inkSelector);
  const operator = themeTokens('[data-mode="operator"]');
  assert.equal(resolve(palette['--color-on-surface'], paper), '#0e131b');
  assert.equal(resolve(palette['--color-glass-tint-webgl'], paper), 'rgba(239, 237, 231, 0.40)');
  assert.ok(contrast(resolve(palette['--color-accent-bright'], paper), resolve(palette['--color-surface'], paper)) >= 3);
  assert.equal(resolve(palette['--color-on-surface'], ink), '#fbf6eb');
  assert.equal(resolve(palette['--color-on-surface'], operator), '#e8ebf2');
  assert.equal(resolve(palette['--color-primary'], operator), '#0b0d12');
  assert.equal(resolve(palette['--color-glass-tint'], operator), 'rgba(17, 20, 28, 0.78)');
  assert.equal(resolve(palette['--color-glass-tint-webgl'], ink), 'rgba(7, 10, 16, 0.30)');

  const paperForeground = resolve(palette['--color-on-paper'], paper);
  const paperBackground = resolve(palette['--color-surface-paper'], paper);
  assert.ok(contrast(paperForeground, paperBackground) >= 4.5);
  assert.ok(contrast(paperForeground, resolve(palette['--color-surface-ivory'], paper)) >= 4.5);
  assert.ok(contrast(resolve(palette['--color-on-surface'], ink), resolve(palette['--color-primary'], ink)) >= 4.5);
  for (const profile of [ink, paper, operator]) {
    assert.ok(contrast(resolve('var(--sl-color-on-paper)', profile), resolve('var(--sl-color-surface-paper)', profile)) >= 4.5);
    assert.ok(contrast(resolve('var(--sl-color-on-paper)', profile), resolve('var(--sl-color-surface-ivory)', profile)) >= 4.5);
  }
  assert.match(paperPage, /<main className="bg-surface-paper text-on-paper">/);
  assert.match(paperPage, /font-serif font-normal text-on-paper/);
});

test('focus treatment retains contrast on both light and dark material surroundings', () => {
  const paper = themeTokens('[data-theme="paper"]');
  const ink = themeTokens(inkSelector);
  const operator = themeTokens('[data-mode="operator"]');
  assert.match(styles, /@layer utilities\s*\{[\s\S]*?\[data-slot="button"\]:focus-visible/);
  assert.match(styles, /\[data-slot="card"\]\[data-interactive\]:focus-visible/);
  assert.match(styles, /\[data-slot="sheet-close"\]:focus-visible/);
  assert.match(styles, /box-shadow: 0 0 0 2px var\(--sl-color-on-surface\), 0 0 0 4px var\(--sl-color-surface\)/);

  for (const variables of [paper, ink, operator]) {
    const ringColors = [
      resolve('var(--sl-color-on-surface)', variables),
      resolve('var(--sl-color-surface)', variables),
    ];
    assert.ok(Math.max(...ringColors.map((color) => contrast(color, '#efede7'))) >= 3);
    assert.ok(Math.max(...ringColors.map((color) => contrast(color, '#070a10'))) >= 3);
  }
  assert.ok(contrast(resolve('var(--sl-color-focus)', paper), '#efede7') >= 3);
  assert.ok(contrast(resolve('var(--sl-color-focus)', ink), '#070a10') >= 3);
});

test('evidence disclosure inherits material text and keeps its state legible without motion', () => {
  assert.match(disclosure, /border-\[var\(--sl-color-hairline,/);
  assert.doesNotMatch(disclosure, /text-\[var\(--sl-fg/);
  assert.match(disclosure, /motion-reduce:transition-none/);
  assert.match(disclosure, /group-open:rotate-45/);
  assert.match(material, /paper: 'bg-surface-paper text-on-paper/);
  assert.match(material, /ink: 'bg-primary text-on-surface/);
});

test('example fonts are unchanged licensed originals with pinned provenance and no Google font loader', () => {
  const directory = 'examples/next-app/app/fonts';
  const provenance = JSON.parse(read(`${directory}/provenance.json`));
  assert.match(provenance.revision, /^[a-f0-9]{40}$/);
  assert.equal(provenance.files.length, 3);
  let bytes = 0;
  for (const font of provenance.files) {
    const data = fs.readFileSync(path.join(root, directory, font.file));
    const license = fs.readFileSync(path.join(root, directory, font.licenseFile));
    assert.equal(data.length, font.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), font.sha256);
    assert.equal(createHash('sha256').update(license).digest('hex'), font.licenseSha256);
    assert.match(license.toString(), /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.ok(font.source.startsWith(`https://raw.githubusercontent.com/google/fonts/${provenance.revision}/ofl/`));
    assert.ok(font.licenseSource.startsWith(`https://raw.githubusercontent.com/google/fonts/${provenance.revision}/ofl/`));
    bytes += data.length;
  }
  assert.equal(bytes, provenance.totalFontBytes);
  assert.ok(bytes <= 2_000_000);
  const layout = read('examples/next-app/app/layout.tsx');
  assert.match(layout, /from 'next\/font\/local'/);
  assert.doesNotMatch(layout, /next\/font\/google/);
});
