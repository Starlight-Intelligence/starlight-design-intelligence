import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { root, verifySources } from './design-toolkit.mjs';

const verification = verifySources();
if (!verification.valid) throw new Error(verification.failures.join('; '));
const result = spawnSync(process.execPath, [join(root, 'vendor/taste/scripts/draw.mjs'), ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: {...process.env, TASTE_SKILL_HISTORY: join(process.cwd(), '.taste-skill/history.json')},
  stdio: 'inherit'
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
