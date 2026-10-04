import fs from 'fs';
const root=new URL('..',import.meta.url).pathname;
const main=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const css=fs.readFileSync(root+'/frontend/src/styles.css','utf8');
const checks=[
 ['single React import',(main.match(/^import React/gm)||[]).length===1],
 ['single modules declaration',(main.match(/^const modules=/gm)||[]).length===1],
 ['single Admin component',(main.match(/^function Admin\(/gm)||[]).length===1],
 ['single Portal component',(main.match(/^function Portal\(/gm)||[]).length===1],
 ['single App component',(main.match(/^function App\(/gm)||[]).length===1],
 ['single root render',(main.match(/createRoot\(/g)||[]).length===1],
 ['public content',main.includes('PublicContentSection')&&main.includes('SCHOOL LIFE')],
 ['content admin',main.includes("['সহশিক্ষা ও অর্জন','content']")&&main.includes("active==='content'&&<ContentPanel/>")],
 ['student CRUD UI',main.includes('StudentPanel')&&main.includes('/students')],
 ['teacher/staff UI',main.includes('StaffPanel')&&main.includes('/teachers')],
 ['attendance UI',main.includes('AttendancePanel')&&main.includes('/attendance/bulk')],
 ['result UI',main.includes('ResultPanel')&&main.includes('/marks')],
 ['routine CRUD UI',main.includes('RoutinePanel')&&main.includes('/routines')],
 ['portal UI',main.includes('StudentPortal')&&main.includes('GuardianPortal')&&main.includes('TeacherPortal')],
 ['AI UI',main.includes('AIPanel')&&main.includes('/ai/conversations')],
 ['document UI',main.includes('DocumentPanel')&&main.includes('/documents/student/')],
 ['V30 readiness',server.includes("version:'V30'")],
 ['security middleware',server.includes('helmet')&&server.includes('rateLimit')],
 ['session revalidation',server.includes('auth_token_version')&&server.includes('token_version')],
 ['backup/restore',fs.existsSync(root+'/scripts/backup.sh')&&fs.existsSync(root+'/scripts/restore.sh')],
 ['responsive styling',css.includes('@media')]
];
let bad=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)bad++}console.log(`${checks.length-bad}/${checks.length} checks passed`);if(bad)process.exit(1);
