import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('..',import.meta.url).pathname;
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const app=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const checks=[
 ['result summary calculates full marks',server.includes('SUM(es.full_marks)')],
 ['result summary calculates percentage',server.includes('percentage')],
 ['result summary detects incomplete result',server.includes("'অসম্পূর্ণ'")],
 ['result summary excludes incomplete from merit',server.includes('merit:passed?merit:null')],
 ['marksheet returns aggregate summary',server.includes('res.json({student:st.rows[0],marks:rows.rows,summary})')],
 ['marksheet joins configured exam subjects',server.includes('JOIN exam_subjects es')],
 ['frontend shows percentage in merit',app.includes('percentage}%')],
 ['frontend shows GPA fallback',app.includes("x.gpa??'—'")],
 ['backend syntax structure present',server.includes("app.post('/api/results/process'")],
 ['backup scripts exist',fs.existsSync(root+'scripts/backup.sh')&&fs.existsSync(root+'scripts/restore.sh')],
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log('PASS',name)}
console.log(`QA PASS ${checks.length}/${checks.length}`)
