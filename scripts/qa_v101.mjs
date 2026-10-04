import fs from 'fs';
const root=new URL('..',import.meta.url).pathname;
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const ui=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const mig=fs.readFileSync(root+'/database/migrations/031_account_provisioning.sql','utf8');
const checks=[
 ['provisioning endpoint',server.includes("/api/users/provision-profile")],
 ['student profile provisioning',server.includes("entity:'student'")||server.includes("student:'student'")],
 ['teacher profile provisioning',server.includes("teacher:'teacher'")],
 ['staff profile provisioning',server.includes("staff:'staff'")],
 ['profile already linked guard',server.includes('ইতিমধ্যে একটি login account যুক্ত আছে')],
 ['transactional account creation',server.includes("BEGIN")&&server.includes("COMMIT")&&server.includes("ROLLBACK")],
 ['one-to-one student user index',mig.includes('uq_students_user_id')],
 ['one-to-one teacher user index',mig.includes('uq_teachers_user_id')],
 ['one-to-one staff user index',mig.includes('uq_staff_user_id')],
 ['admin navigation Profile to Login',ui.includes("['provision','Profile → Login']")],
 ['ProfileProvisionPanel',ui.includes('function ProfileProvisionPanel')],
 ['provisioning API used by UI',ui.includes("api('/users/provision-profile'")]
];
let pass=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`);if(ok)pass++;}
console.log(`V101 QA: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1);
