import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const migration=fs.readFileSync(root+'database/migrations/023_assignment_feedback.sql','utf8');
const checks=[
 ['assignment due-date guard',server.includes("Assignment জমাদানের সময় শেষ হয়েছে")],
 ['student class scoping',server.includes('assignment আপনার শ্রেণির জন্য নয়')],
 ['student answer validation',server.includes('উত্তর বা attachment দিতে হবে')],
 ['teacher submission list endpoint',server.includes("/api/portal/teacher/assignment-submissions")],
 ['teacher ownership guard',server.includes('এই assignment-এর submissions আপনার অনুমোদিত নয়')],
 ['teacher grade validation',server.includes('Number(q.rows[0].max_marks)')],
 ['teacher feedback persisted',server.includes('teacher_feedback=$2')],
 ['student feedback selected',server.includes('sub.teacher_feedback')],
 ['student submission form',jsx.includes('অ্যাসাইনমেন্ট জমা দিন')],
 ['teacher grading UI',jsx.includes('অ্যাসাইনমেন্ট ও জমা মূল্যায়ন')],
 ['feedback migration',migration.includes('ADD COLUMN IF NOT EXISTS teacher_feedback')],
 ['V50 regression QA',fs.existsSync(root+'scripts/qa_v50.mjs')]
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`V51 QA PASS: ${checks.length}/${checks.length}`);
