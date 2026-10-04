import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const checks=[
 ['migration 029 exists',fs.existsSync(path.join(root,'database/migrations/029_form_builder.sql'))],
 ['parent_key migration',fs.readFileSync(path.join(root,'database/migrations/029_form_builder.sql'),'utf8').includes('ADD COLUMN IF NOT EXISTS parent_key')],
 ['form_fields table',fs.readFileSync(path.join(root,'database/migrations/029_form_builder.sql'),'utf8').includes('CREATE TABLE IF NOT EXISTS form_fields')],
 ['form builder API',fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8').includes('/api/admin/form-fields')],
 ['Form Builder UI',fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8').includes('function FormBuilderPanel')],
 ['custom field renderer',fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8').includes('function CustomFields')],
 ['student custom fields wired',fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8').includes('formKey="student"')],
 ['teacher/staff custom fields wired',fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8').includes('formKey={isTeacher?"teacher":"staff"}')],
 ['V91 health',fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8').includes("version:'V91'")],
 ['release note',fs.existsSync(path.join(root,'docs/V91-CHANGELOG.md'))]
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${name}`); if(ok)pass++;}
if(pass!==checks.length)process.exit(1);
console.log(`V91 QA: ${pass}/${checks.length} PASS`);
