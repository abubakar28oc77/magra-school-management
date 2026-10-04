import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
const check = (name, pass, detail='') => checks.push({name, pass:Boolean(pass), detail});
const env = process.env;
const db = env.DATABASE_URL || '';

check('NODE_ENV is not production', env.NODE_ENV !== 'production', env.NODE_ENV || '(unset)');
check('DATABASE_URL is present', Boolean(db));
check('DATABASE_URL is not the example placeholder', !db.includes('PASTE_YOUR_TEMPORARY_POSTGRES_CONNECTION_STRING_HERE'));
check('PILOT_DB_SSL is explicitly configured', env.PILOT_DB_SSL === 'true' || env.PILOT_DB_SSL === 'false', env.PILOT_DB_SSL || '(unset)');
check('Pilot seed exists', fs.existsSync(path.join(root,'database/pilot/pilot_seed.sql')));
check('Pilot verification exists', fs.existsSync(path.join(root,'scripts/pilot_verify.mjs')));
check('Restore guard exists', fs.readFileSync(path.join(root,'scripts/restore.sh'),'utf8').includes('PILOT_RESTORE_CONFIRM'));
check('Backup script exists', fs.existsSync(path.join(root,'scripts/backup.sh')));

for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} | ${c.name}${c.detail ? ` | ${c.detail}` : ''}`);
const failed = checks.filter(c => !c.pass).length;
console.log(`PILOT PREFLIGHT: ${checks.length-failed}/${checks.length} PASS`);
process.exitCode = failed ? 1 : 0;
