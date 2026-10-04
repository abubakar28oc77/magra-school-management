import fs from 'node:fs';
const server=fs.readFileSync('backend/src/server.js','utf8');
const jsx=fs.readFileSync('frontend/src/main.jsx','utf8');
const checks=[
 ['teacher marks roster endpoint',server.includes("/api/portal/teacher/marks-roster")],
 ['teacher marks save endpoint',server.includes("/api/portal/teacher/marks-save")],
 ['teacher marks role guard',server.includes("allow('teacher','head_teacher','assistant_head_teacher')")],
 ['teacher class scope',server.includes("class_name=$2")],
 ['teacher subject responsibility scope',server.includes("AND subject_id=$4")],
 ['student class validation on save',server.includes("শিক্ষার্থী এই শ্রেণি/শাখার নয়")],
 ['marks component validation',server.includes('কম্পোনেন্টের নির্ধারিত পূর্ণ নম্বরের বেশি')],
 ['teacher portal result section',jsx.includes('RESULT MANAGEMENT')],
 ['exam selector',jsx.includes('পরীক্ষা নির্বাচন')],
 ['subject selector',jsx.includes('বিষয় নির্বাচন')],
 ['marks save action',jsx.includes("/portal/teacher/marks-save")],
 ['attendance retained',jsx.includes('দ্রুত উপস্থিতি')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} — ${n}`); if(ok)pass++;}
console.log(`V44 QA: ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
