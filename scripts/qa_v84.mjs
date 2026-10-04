import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
const ok = (name, condition, detail='') => checks.push({name, pass:Boolean(condition), detail});
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');

ok('pilot seed exists', fs.existsSync(path.join(root,'database/pilot/pilot_seed.sql')));
ok('pilot seed explicitly marked non-production', /PILOT ONLY|DO NOT use this file for production/.test(read('database/pilot/pilot_seed.sql')));
ok('synthetic pilot teacher IDs', ['PILOT-T01','PILOT-T02','PILOT-T03'].every(x=>read('database/pilot/pilot_seed.sql').includes(x)));
ok('two students for every class 6-10', ['06-01','06-02','07-01','07-02','08-01','08-02','09-01','09-02','10-01','10-02'].every(x=>read('database/pilot/pilot_seed.sql').includes(`PILOT-${x}`)));
ok('pilot password change required', /must_change_password\).*TRUE|must_change_password\)\s*SELECT/.test(read('database/pilot/pilot_seed.sql')));
ok('guardian link seeded', read('database/pilot/pilot_seed.sql').includes('guardian_student_links'));
ok('attendance smoke data', read('database/pilot/pilot_seed.sql').includes('INSERT INTO attendance'));
ok('result smoke data', read('database/pilot/pilot_seed.sql').includes('INSERT INTO marks'));
ok('assignment smoke data', read('database/pilot/pilot_seed.sql').includes('assignment_submissions'));
ok('finance smoke data', read('database/pilot/pilot_seed.sql').includes('INSERT INTO fees'));
ok('library smoke data', read('database/pilot/pilot_seed.sql').includes('INSERT INTO library_loans'));
ok('notice smoke data', read('database/pilot/pilot_seed.sql').includes('INSERT INTO notices'));
ok('pilot plan retained', fs.existsSync(path.join(root,'docs/PILOT-TEST-PLAN.md')));
ok('pilot data templates retained', fs.existsSync(path.join(root,'docs/pilot-data/students-template.csv')) && fs.existsSync(path.join(root,'docs/pilot-data/teachers-template.csv')));
ok('production domain not referenced for mutation', !/curl|wget|ssh|scp|ftp/i.test(read('database/pilot/pilot_seed.sql')));

for (const c of checks) console.log(`${c.pass?'PASS':'FAIL'} | ${c.name}${c.detail?` | ${c.detail}`:''}`);
const failed = checks.filter(c=>!c.pass).length;
console.log(`V84 QA: ${checks.length-failed}/${checks.length} PASS`);
process.exitCode = failed ? 1 : 0;
