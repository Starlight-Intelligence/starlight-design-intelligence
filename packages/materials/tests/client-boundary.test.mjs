import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src');

function portableRelativePath(path, root = sourceRoot) {
  const normalize = (value) => value.replaceAll('\\', '/');
  return normalize(path).slice(normalize(root).length + 1);
}

async function localExportGraph(entry, visited = new Map()) {
  const path = resolve(sourceRoot, entry);
  if (visited.has(path)) return visited;
  const source = await readFile(path, 'utf8');
  visited.set(path, source);
  const exports = source.matchAll(/export\s+(?:\*|\{[\s\S]*?\})\s+from\s+['"]([^'"]+)['"]/g);
  for (const [, specifier] of exports) {
    if (!specifier?.startsWith('.')) continue;
    await localExportGraph(join(dirname(entry), specifier), visited);
  }
  return visited;
}

test('public server-safe barrels expose gpuPlan without an unmarked hook module', async () => {
  const [rootGraph, gateGraph] = await Promise.all([
    localExportGraph('index.ts'),
    localExportGraph('gate/index.ts'),
  ]);
  const hook = [...rootGraph].find(([path]) => portableRelativePath(path) === 'gate/use-glass-plan.ts');
  const windowsRoot = sourceRoot.replaceAll('/', '\\');
  const windowsHook = `${windowsRoot}\\gate\\use-glass-plan.ts`;

  assert.equal(portableRelativePath(windowsHook, windowsRoot), 'gate/use-glass-plan.ts');
  assert.equal(portableRelativePath(`${sourceRoot}/gate/use-glass-plan.ts`), 'gate/use-glass-plan.ts');
  assert.ok(rootGraph.has(resolve(sourceRoot, 'gate/glass-gate.ts')));
  assert.ok(gateGraph.has(resolve(sourceRoot, 'gate/glass-gate.ts')));
  assert.ok(hook, 'the public barrels should continue to expose useGlassPlan');
  assert.match(rootGraph.get(resolve(sourceRoot, 'gate/index.ts')), /gpuPlan/);
  assert.match(rootGraph.get(resolve(sourceRoot, 'index.ts')), /gate\/index\.ts/);
  assert.match(hook[1].replace(/^(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*/, ''), /^(['"])use client\1\s*;/);
  assert.doesNotMatch(rootGraph.get(resolve(sourceRoot, 'gate/glass-gate.ts')), /^\s*(['"])use client\1/m);
});
