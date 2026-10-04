import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const checks=[];
const c=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const server=read('backend/src/server.js');
const front=read('frontend/src/main.jsx');
const schema=read('database/schema.sql');
const doc=read('docs/FINAL-ACCEPTANCE-V115.md');

c('V115 acceptance document', doc.toLowerCase().includes('final acceptance') && doc.includes('Pilot acceptance'));
c('Backup script exists', fs.existsSync(path.join(root,'scripts/backup.sh')));
c('Restore script exists', fs.existsSync(path.join(root,'scripts/restore.sh')));
c('Backup checksum enabled', read('scripts/backup.sh').includes('sha256sum'));
c('Restore checksum verification', read('scripts/restore.sh').includes('sha256sum -c'));
c('Pilot verification refuses production', read('scripts/pilot_verify.mjs').includes("NODE_ENV === 'production'"));
c('Student import capped at 500', server.includes('students/bulk-import') && server.includes('সর্বোচ্চ ৫০০ জন'));
c('Teacher import capped at 500', server.includes("teachers/bulk-import") && server.includes('সর্বোচ্চ 500টি'));
c('Staff import capped at 500', server.includes("staff/bulk-import") && server.includes('সর্বোচ্চ 500টি'));
c('Student duplicate upsert', server.includes('ON CONFLICT(student_id) DO UPDATE'));
c('Teacher duplicate upsert', server.includes('ON CONFLICT(employee_id) DO UPDATE') && server.includes("bulk_import','teacher"));
c('Staff duplicate upsert', server.includes('ON CONFLICT(employee_id) DO UPDATE') && server.includes("bulk_import','staff"));
c('Student CSV export UI', front.includes("magra-students.csv") && front.includes('CSV রিপোর্ট'));
c('Teacher/staff CSV export UI', front.includes('magra-teachers.csv') && front.includes('magra-staff.csv'));
c('Audit logging helper', server.includes("INSERT INTO audit_logs"));
c('Attendance pagination', server.includes("app.get('/api/attendance/roster'") && server.includes('total_pages'));
c('V115 migration present', fs.existsSync(path.join(root,'database/migrations/037_scale_hardening.sql')) && schema.includes('V115 performance hardening'));

for(const x of checks) console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?` | ${x.detail}`:''}`);
const failed=checks.filter(x=>!x.pass).length;
console.log(`V115 ACCEPTANCE STATIC QA: ${checks.length-failed}/${checks.length} PASS`);
process.exitCode=failed?1:0;
