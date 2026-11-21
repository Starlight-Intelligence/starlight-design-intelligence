// Builds the shadcn registry item for the Glass Core AI startup site kit.
// Source lives in site-kit/ at the same relative paths it installs to, so the
// target of every file is `~/<path>` (project root) in the consumer.
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

const DIRS = ['app', 'components/site', 'lib'];
const walk = async (dir) => (await Promise.all((await readdir(dir, {withFileTypes: true})).map(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
}))).flat();

export const siteKitDependencies = [
  'gsap@3.15.1',
  '@gsap/react@2.1.2',
  '@fontsource/instrument-sans@5.3.0',
  '@fontsource/instrument-serif@5.3.0',
  '@fontsource/ibm-plex-mono@5.3.0',
];

export async function buildSiteKitItem(root) {
  const base = path.join(root, 'site-kit');
  const files = [];
  for (const d of DIRS) for (const abs of (await walk(path.join(base, d))).sort()) {
    const rel = path.relative(base, abs).split(path.sep).join('/');
    const page = /^app\/(.+\/)?page\.tsx$/.test(rel);
    files.push({path: `site-kit/${rel}`, type: page ? 'registry:page' : 'registry:file', target: `~/${rel}`, content: await readFile(abs, 'utf8')});
  }
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: 'glass-core-site',
    type: 'registry:block',
    title: 'Glass Core AI startup site',
    description: 'Landing, pricing and docs shell for an AI startup on Next.js App Router. Phone first, one GPU surface with poster fallback, GSAP motion with a reduced-motion path, llms.txt, /.well-known/starlight.json, JSON-LD Product and Offer, a read-only MCP stub and an agent slot. Install with starlight-living. Replaces app/layout.tsx and app/page.tsx. Review candidate.',
    dependencies: siteKitDependencies,
    files,
  };
}
