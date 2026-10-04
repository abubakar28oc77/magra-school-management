import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const front=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const back=fs.readFileSync(root+'/backend/src/server.js','utf8');
const checks=[
 ['student CSV complete fields', ['student_nid_no','father_name_en','father_nid_no','mother_name_en','mother_nid_no','guardian_name_en','current_village','permanent_district','primary_school_name','special_needs'].every(x=>front.includes(x))],
 ['teacher CSV import UI', front.includes('/teachers/bulk-import') && front.includes('magra-teacher-import-template.csv')],
 ['staff CSV import UI', front.includes('/staff/bulk-import') && front.includes('magra-staff-import-template.csv')],
 ['teacher bulk endpoint', back.includes("app.post('/api/teachers/bulk-import'")],
 ['staff bulk endpoint', back.includes("app.post('/api/staff/bulk-import'")],
 ['500 record guard', back.includes('rows.length>500')],
 ['role protected imports', back.includes("allow(...managerRoles)")],
 ['V106 documentation', fs.existsSync(root+'/docs/V106-FORM-FIELD-COMPLIANCE.md')]
];
let failed=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(!ok) failed++;}
process.exit(failed?1:0);
