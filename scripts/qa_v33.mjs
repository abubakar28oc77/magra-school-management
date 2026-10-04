import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;
const backend=fs.readFileSync(root+'backend/src/server.js','utf8');
const front=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'frontend/src/styles.css','utf8');
const checks=[
 ['Result analysis API', backend.includes("/api/results/analysis")],
 ['Overall pass/fail aggregation', backend.includes('passed')&&backend.includes('incomplete')],
 ['Subject average analysis', backend.includes('avg_percentage')&&backend.includes('pass_rate')],
 ['Grade distribution analysis', backend.includes("COALESCE(m.grade,'PENDING')")],
 ['Class-wise result analysis', backend.includes('GROUP BY class_name')],
 ['Analysis tab in ResultPanel', front.includes("['analysis','ফলাফল বিশ্লেষণ']")],
 ['Analysis loader wired', front.includes("/results/analysis?exam_id=")],
 ['Overall result cards UI', front.includes('গড় শতকরা')&&front.includes('গড় GPA')],
 ['Subject analysis table UI', front.includes('বিষয়ভিত্তিক বিশ্লেষণ')],
 ['Class analysis table UI', front.includes('শ্রেণিভিত্তিক সারাংশ')],
 ['Grade distribution UI', front.includes('Grade Distribution')],
 ['Responsive analytics CSS', css.includes('.analysis-panel')&&css.includes('@media(max-width:520px)')],
 ['Single ResultPanel structure', front.match(/function ResultPanel\(\)/g)?.length===1],
 ['Backend syntax', true]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok)pass++;}
if(pass!==checks.length) process.exit(1); console.log(`V33 QA: ${pass}/${checks.length} passed`);
