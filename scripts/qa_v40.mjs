import fs from 'fs';
const backend=fs.readFileSync('backend/src/server.js','utf8');
const front=fs.readFileSync('frontend/src/main.jsx','utf8');
const checks=[
 ['marks bulk limit',backend.includes("records.length>1000")],
 ['marks component validation',backend.includes('কম্পোনেন্টের নির্ধারিত পূর্ণ নম্বরের বেশি')],
 ['marksheet student scope',backend.includes('students WHERE id=$1 AND user_id=$2')],
 ['marksheet guardian scope',backend.includes('guardian_student_links WHERE student_id=$1 AND guardian_user_id=$2')],
 ['marksheet summary',backend.includes('summary.result_status')],
 ['marksheet total preview',front.includes('doc.summary.total_marks')],
 ['marksheet percentage preview',front.includes('doc.summary.percentage')],
 ['marksheet GPA preview',front.includes('doc.summary.gpa')],
 ['marksheet result preview',front.includes('doc.summary.result_status')],
 ['print action',front.includes('Print / PDF')],
 ['attendance endpoint retained',backend.includes("app.post('/api/attendance/bulk'")],
 ['V40 notes',fs.existsSync('docs/V40-release-notes.md')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`); if(ok)pass++;}
console.log(`V40 QA: ${pass}/${checks.length}`); if(pass!==checks.length) process.exit(1);
