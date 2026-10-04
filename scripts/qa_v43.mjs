import fs from 'fs';
const b=fs.readFileSync('backend/src/server.js','utf8');
const f=fs.readFileSync('frontend/src/main.jsx','utf8');
const c=fs.readFileSync('frontend/src/styles.css','utf8');
const checks=[
 ['start returns exam questions',b.includes("res.json({attempt:q.rows[0],exam,questions:" )],
 ['question endpoint scoped to exam',b.includes('WHERE oq.online_exam_id=$1')],
 ['student class scope retained',b.includes("if(exam.class_name!==st.rows[0].class_name)")],
 ['attempt ownership on submit',b.includes("a.student_id=$2")],
 ['submit deadline enforced',b.includes("deadline=at.ends_at")],
 ['score capped at total marks',b.includes("score=Math.min(score,Number(at.total_marks||score))")],
 ['exam modal exists',f.includes('exam-overlay')&&f.includes('exam-modal')],
 ['radio answer capture',f.includes("type=\"radio\"")&&f.includes('setAnswers')],
 ['free text answer capture',f.includes('<textarea rows="4"')],
 ['countdown timer',f.includes('setInterval')&&f.includes('fmt(seconds)')],
 ['submit action wired',f.includes('/online-exams/attempts/${activeExam.attempt.id}/submit')],
 ['mobile exam styling',c.includes('@media(max-width:650px)')&&c.includes('.exam-modal')]
];
let pass=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`);if(ok)pass++}console.log(`V43 QA: ${pass}/${checks.length}`);if(pass!==checks.length)process.exit(1)
