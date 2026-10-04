import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const checks = [];
const check = (name, pass, detail='') => checks.push({name, pass:Boolean(pass), detail});
const exists = (p) => fs.existsSync(path.join(root,p));

check('schema.sql exists', exists('database/schema.sql'));
const migrationFiles = fs.readdirSync(path.join(root,'database/migrations')).map(x => x.split('_')[0]);
check('migration chain 006-037 exists', Array.from({length:32},(_,i)=>String(i+6).padStart(3,'0')).every(n => migrationFiles.includes(n)));
check('pilot seed exists', exists('database/pilot/pilot_seed.sql'));
check('pilot verify exists', exists('scripts/pilot_verify.mjs'));
check('pilot preflight exists', exists('scripts/preflight_pilot.mjs'));
check('backup script exists', exists('scripts/backup.sh'));
check('restore guard exists', exists('scripts/restore.sh'));
check('backend syntax', spawnSync(process.execPath,['--check','backend/src/server.js'],{cwd:root,stdio:'ignore'}).status===0);
check('frontend package exists', exists('frontend/package.json'));
check('frontend source exists', exists('frontend/src/main.jsx'));

const nm = exists('frontend/node_modules') && exists('frontend/node_modules/.bin/vite');
if (nm) {
  const r = spawnSync('npm',['run','build'],{cwd:path.join(root,'frontend'),stdio:'ignore',shell:false});
  check('frontend production build', r.status===0, r.status===0?'':'npm run build failed');
} else {
  check('frontend production build', false, 'BLOCKED: frontend/node_modules is not installed in this environment; run npm ci then npm run build on a machine with package installation access.');
}

for (const c of checks) console.log(`${c.pass ? 'PASS' : 'BLOCKED/FAIL'} | ${c.name}${c.detail ? ` | ${c.detail}` : ''}`);
const failed = checks.filter(c => !c.pass).length;
console.log(`V117 RELEASE GATE: ${checks.length-failed}/${checks.length} PASS`);
process.exitCode = failed ? 1 : 0;
