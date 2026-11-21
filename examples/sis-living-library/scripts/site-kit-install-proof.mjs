// Proves a stranger can install the Glass Core site kit into a clean Next.js app.
// 1. create-next-app (pinned) in an empty directory
// 2. components.json written by hand (shadcn init needs ui.shadcn.com; see INSTALL log)
// 3. shadcn add starlight-living + glass-core-site from local registry JSON
// 4. next build
// Usage: node scripts/site-kit-install-proof.mjs <empty-dir> [log-file]
import {mkdir, writeFile, readdir, appendFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const dir = path.resolve(process.argv[2] ?? 'site-kit-proof');
const log = path.resolve(process.argv[3] ?? path.join(root, 'site-kit/INSTALL-PROOF.log'));
await mkdir(dir, {recursive: true});
if ((await readdir(dir)).length) throw new Error(`${dir} is not empty`);
await writeFile(log, `# Glass Core site kit install proof\n# started ${new Date().toISOString()}\n# node ${process.version}\n`);

const run = (cmd, args, cwd) => new Promise((resolve, reject) => {
  const line = `\n$ ${[cmd, ...args].join(' ')}  (cwd: ${path.basename(cwd)})\n`;
  process.stdout.write(line);
  appendFile(log, line);
  const child = spawn(cmd, args, {cwd, env: {...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: '1'}});
  const out = d => { process.stdout.write(d); appendFile(log, d.toString().replace(/\x1b\[[0-9;]*m/g, '')); };
  child.stdout.on('data', out);
  child.stderr.on('data', out);
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${cmd} ${args[0]} exited ${code}`)));
});

const app = path.join(dir, 'app-under-test');
await run('npx', ['--yes', 'create-next-app@16.4.6', app, '--ts', '--app', '--no-tailwind', '--no-eslint', '--no-src-dir', '--no-turbopack', '--import-alias', '@/*', '--use-npm', '--yes'], dir);
await writeFile(path.join(app, 'components.json'), JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: true, tsx: true,
  tailwind: {config: '', css: 'app/globals.css', baseColor: '', cssVariables: true},
  aliases: {components: '@/components', utils: '@/lib/utils', ui: '@/components/ui', lib: '@/lib', hooks: '@/hooks'},
}, null, 2));
await appendFile(log, '\n# wrote components.json by hand. baseColor is empty: this consumer has no Tailwind, and shadcn only fetches ui.shadcn.com/r/colors when baseColor is set (that host is blocked in this sandbox)\n');
await run('npx', ['--yes', 'shadcn@4.23.0', 'add', path.join(root, 'public/r/starlight-living.json'), path.join(root, 'public/r/glass-core-site.json'), '--yes', '--overwrite'], app);
await run('npx', ['next', 'build'], app);
await appendFile(log, `\n# PASS ${new Date().toISOString()}: clean create-next-app + shadcn add + next build\n`);
console.log(`\nPASS. App at ${app}. Log at ${log}`);
