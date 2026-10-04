import fs from 'fs';
const root=new URL('..',import.meta.url).pathname;
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const ui=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const mig=fs.readFileSync(root+'/database/migrations/032_guardian_account_provisioning.sql','utf8');
const checks=[
 ['guardian provisioning endpoint',server.includes('/api/users/provision-guardian-from-student')],
 ['guardian role validation',server.includes("roleQ=await client.query('SELECT id FROM roles WHERE name=$1',['guardian'])")],
 ['student profile lookup',server.includes('SELECT * FROM students WHERE id=$1 FOR UPDATE')],
 ['guardian name fallback',server.includes('student.mother_name')&&server.includes('student.father_name')&&server.includes('student.guardian_name')],
 ['guardian-student link creation',server.includes('INSERT INTO guardian_student_links')],
 ['transactional provisioning',server.includes("await client.query('BEGIN')")&&server.includes("await client.query('COMMIT')")&&server.includes("await client.query('ROLLBACK')")],
 ['audit trail',server.includes("provision_guardian_account")],
 ['guardian UI option',ui.includes('অভিভাবক (শিক্ষার্থী থেকে)')],
 ['guardian UI endpoint',ui.includes("'/users/provision-guardian-from-student'")],
 ['guardian relation selector',ui.includes('local_guardian')&&ui.includes('guardianName')],
 ['V102 migration',mig.includes('V102')&&mig.includes('idx_users_guardian_phone')],
 ['V101 provisioning retained',server.includes("/api/users/provision-profile")&&ui.includes("/users/provision-profile")]
];let pass=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`);if(ok)pass++;}console.log(`V102 QA: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
