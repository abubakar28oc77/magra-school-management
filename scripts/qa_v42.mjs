import fs from 'fs';
const backend=fs.readFileSync('backend/src/server.js','utf8');
const front=fs.readFileSync('frontend/src/main.jsx','utf8');
const css=fs.readFileSync('frontend/src/styles.css','utf8');
const checks=[
 ['student portal online exams query',backend.includes('data.onlineExams=')&&backend.includes('online_exam_attempts')],
 ['online exam class scope',backend.includes("e.class_name=$2")],
 ['published exam scope',backend.includes("e.status='published'")],
 ['student attempt scope',backend.includes('a.student_id=$1')],
 ['online exam portal section',front.includes('অনলাইন পরীক্ষা ও কুইজ')],
 ['online exam count',front.includes('(data.onlineExams||[]).length')],
 ['start exam action',front.includes("/online-exams/${e.id}/start")],
 ['submitted score display',front.includes('e.score??0')],
 ['learning empty state',front.includes('এখনো কোনো ডিজিটাল কনটেন্ট প্রকাশিত হয়নি')],
 ['V41 regression suite',fs.existsSync('scripts/qa_v41.mjs')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`); if(ok)pass++;}
console.log(`V42 QA: ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
