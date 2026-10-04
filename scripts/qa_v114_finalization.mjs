import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const schema=fs.readFileSync(path.join(root,'database/schema.sql'),'utf8');
const migrationDir=path.join(root,'database/migrations');
const migration=fs.readFileSync(path.join(migrationDir,'036_teacher_directory_timestamps.sql'),'utf8');
const frontend=fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8');
const migrations=fs.readdirSync(migrationDir).filter(f=>/^\d{3}_.*\.sql$/.test(f)).sort();
const nums=migrations.map(f=>Number(f.slice(0,3)));
const expected=[]; for(let n=6;n<=36;n++) expected.push(n);
const checks=[
 ['V114 server version',server.includes("version:'V114'") && server.includes('Magra School API V114 running')],
 ['Public stats includes active teacher count',server.includes("SELECT COUNT(*)::int AS count FROM teachers WHERE status='active'") && server.includes('teachers:teachers.rows[0].count')],
 ['Teacher timestamps migration',/ADD COLUMN IF NOT EXISTS created_at/.test(migration)&&/ADD COLUMN IF NOT EXISTS updated_at/.test(migration)],
 ['Teacher updated_at index',migration.includes('idx_teachers_updated_at')],
 ['Schema has teacher timestamps',schema.includes('ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at')],
 ['Dynamic student total',frontend.includes("stats?.total??'—'")],
 ['Dynamic teacher total',frontend.includes("stats?.teachers??'—'")],
 ['Dynamic classwise total',frontend.includes("<strong>{stats?.total??'—'}</strong>") && frontend.includes('শ্রেণি ${x.label}: ${x.count}')],
 ['Dynamic contact route',server.includes("app.get('/api/public/contact'")],
 ['Student bulk import',server.includes("app.post('/api/students/bulk-import'")],
 ['Teacher bulk import',server.includes("app.post('/api/teachers/bulk-import'")],
 ['Staff bulk import',server.includes("app.post('/api/staff/bulk-import'")],
 ['Student pagination',server.includes("FROM students")&&server.includes('total_pages')],
 ['Teacher pagination',server.includes("FROM teachers")&&server.includes('total_pages')],
 ['Staff pagination',server.includes("FROM staff")&&server.includes('total_pages')],
 ['Dynamic public contact enabled/status filtering',server.includes('status=\'active\' AND public_contact_enabled=true')],
 ['Contact role fields in teacher form',frontend.includes('public_contact_role')&&frontend.includes('public_contact_enabled')],
 ['Emergency services present',frontend.includes("['333','তথ্য ও সেবা'")&&frontend.includes("['999','জরুরি সেবা'")&&frontend.includes("['1098','শিশুর সহায়তায় ফোন'")],
 ['Academic clubs present',frontend.includes('বিজ্ঞান ক্লাব')&&frontend.includes('আইসিটি ক্লাব')&&frontend.includes('ভাষা ও সাহিত্য ক্লাব')&&frontend.includes('ডিবেটিং ক্লাব')],
 ['Migration chain 006-036 complete',JSON.stringify(nums)===JSON.stringify(expected)],
];
let passed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} | ${name}`); if(ok)passed++;}
console.log(`V114 Finalization QA: ${passed}/${checks.length} PASS`);
if(passed!==checks.length)process.exit(1);
