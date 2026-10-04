import fs from 'fs';
import {fileURLToPath} from 'url';
const root=fileURLToPath(new URL('..',import.meta.url));
const frontend=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const backend=fs.readFileSync(root+'backend/src/server.js','utf8');
const checks=[
 ['CSV helper present',frontend.includes('function downloadCsv')&&frontend.includes('function flattenCustom')],
 ['Student custom-field filter UI',frontend.includes("form_key=student")&&frontend.includes('customFieldKey')&&frontend.includes('CSV রিপোর্ট')],
 ['Student custom-field search API',backend.includes("app.get('/api/students'")&&backend.includes("custom_field_key=''")&&backend.includes("extended_profile->'custom_fields'")],
 ['Teacher custom-field search API',backend.includes("app.get('/api/teachers'")&&backend.includes("custom_field_key=''")&&backend.includes("COALESCE(extended_profile->'custom_fields'")],
 ['Staff custom-field search API',backend.includes("app.get('/api/staff'")&&backend.includes("custom_field_key=''")],
 ['Teacher/Staff custom-field filter UI',frontend.includes("form_key=\'+ (isTeacher?'teacher':'staff')")&&frontend.includes('exportPeople')],
 ['Form Builder retained',frontend.includes('function FormBuilderPanel')&&backend.includes("/api/admin/form-fields")],
 ['Feature Control retained',frontend.includes('function FeatureControlPanel')&&backend.includes("/api/admin/features")],
 ['Voter/Village retained',frontend.includes('function VoterListPanel')&&frontend.includes('function VillageStudentPanel')],
 ['Bilingual document generator retained',frontend.includes('function DocumentPanel')&&frontend.includes('docLabel')]
];
let ok=0;for(const [n,p] of checks){console.log(`${p?'PASS':'FAIL'} - ${n}`);if(p)ok++}
console.log(`V99 QA: ${ok}/${checks.length}`);if(ok!==checks.length)process.exit(1);
