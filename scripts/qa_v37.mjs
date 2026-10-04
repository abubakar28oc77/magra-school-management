import fs from 'node:fs';
const front=fs.readFileSync('frontend/src/main.jsx','utf8');
const back=fs.readFileSync('backend/src/server.js','utf8');
const checks=[
 ['content update uses route id parameter', back.includes('WHERE id=$10 RETURNING *') && back.includes('Number(x.sort_order||0),req.params.id')],
 ['content update validates required fields', back.includes("if(!x.content_type||!x.title_bn)return res.status(400)")],
 ['guardian finance data', back.includes('data.finance=') && back.includes('FROM fees f WHERE f.student_id=ANY')],
 ['guardian fee details', back.includes('data.fees=') && back.includes('paid_amount')],
 ['guardian assignments', back.includes('data.assignments=') && back.includes('a.class_name=ANY')],
 ['guardian fee UI', front.includes('ফি ও বকেয়া')],
 ['guardian assignment UI', front.includes('<h2>অ্যাসাইনমেন্ট</h2>')],
 ['portal notification UI', front.includes('<Notifications items={data.notifications}/>')],
 ['V37 QA script', fs.existsSync('scripts/qa_v37.mjs')],
 ['school identity', front.includes('EIIN 114290')],
];
let pass=0; for(const [n,ok] of checks){console.log((ok?'PASS':'FAIL'),n); if(ok)pass++;}
if(pass!==checks.length)process.exit(1); console.log(`V37 QA PASS: ${pass}/${checks.length}`);
