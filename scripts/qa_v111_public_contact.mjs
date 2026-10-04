import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname.replace(/\/$/,'');
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const mig=fs.readFileSync(root+'/database/migrations/035_public_contact_sync.sql','utf8');
const jsx=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const checks=[
 ['public contact endpoint',server.includes("app.get('/api/public/contact'"),server],
 ['active-only contact filtering',server.includes("status='active' AND public_contact_enabled=true"),server],
 ['four public contact roles',server.includes("head_teacher")&&server.includes("assistant_head_teacher")&&server.includes("ict_teacher")&&server.includes("office_assistant"),server],
 ['teacher/staff contact columns',mig.includes('public_contact_role')&&mig.includes('public_contact_enabled'),mig],
 ['contact indexes',mig.includes('idx_teachers_public_contact')&&mig.includes('idx_staff_public_contact'),mig],
 ['frontend fetches public contact',jsx.includes("api('/public/contact')"),jsx],
 ['contact uses profile name/phone/email',jsx.includes('p?.phone')&&jsx.includes('p?.email')&&jsx.includes('p?.name_bn'),jsx],
 ['retired/inactive message documented',jsx.includes('inactive/retired'),jsx]
];
let fail=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)fail++;}process.exit(fail?1:0);
