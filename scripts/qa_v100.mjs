import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const front=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const checks=[
 ['guardian link list endpoint',server.includes("app.get('/api/portal/links'")],
 ['guardian role validation',server.includes("role_name!=='guardian'")],
 ['student role validation',server.includes("role_name!=='student'")],
 ['guardian link insert',server.includes('guardian_student_links(guardian_user_id,student_id,relation)')],
 ['student profile account link',server.includes("UPDATE students SET user_id=$1")],
 ['Student/Guardian nav',front.includes("['links','Student/Guardian Link']")],
 ['link panel',front.includes('Student / Guardian Link')],
 ['guardian account picker',front.includes("u.role_name==='guardian'")],
 ['student account picker',front.includes("u.role_name==='student'")],
 ['link API calls',front.includes("/portal/link-student")&&front.includes("/portal/student-user")],
 ['link listing table',front.includes('Guardian–Student সম্পর্ক')],
 ['V99 features retained',front.includes('FeatureControlPanel')&&front.includes('FormBuilderPanel')]
];
let pass=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(ok)pass++;}
if(pass!==checks.length)process.exit(1);console.log(`V100 QA ${pass}/${checks.length} PASS`);
