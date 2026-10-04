import fs from 'fs';
const backend=fs.readFileSync('backend/src/server.js','utf8');
const front=fs.readFileSync('frontend/src/main.jsx','utf8');
const css=fs.readFileSync('frontend/src/styles.css','utf8');
const checks=[
 ['teacher roster route',backend.includes("app.get('/api/portal/teacher/roster'")],
 ['teacher roster role guard',backend.includes("allow('teacher','head_teacher','assistant_head_teacher')")],
 ['teacher class scope',backend.includes('এই শ্রেণির attendance আপনার দায়িত্বে নেই')],
 ['teacher roster date filter',backend.includes('attendance_date=$1::date')],
 ['teacher portal attendance UI',front.includes('দ্রুত উপস্থিতি')],
 ['teacher portal save attendance',front.includes("api('/attendance/bulk'")],
 ['teacher portal class selector',front.includes('দায়িত্বপ্রাপ্ত শ্রেণি')],
 ['teacher attendance status buttons',front.includes('অনুপস্থিত')&&front.includes('দেরি')],
 ['attendance action styling',css.includes('.attendance-actions')],
 ['V40 regression suite',fs.existsSync('scripts/qa_v40.mjs')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`); if(ok)pass++;}
console.log(`V41 QA: ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
