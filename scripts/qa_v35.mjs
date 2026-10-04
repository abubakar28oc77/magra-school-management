import fs from 'fs';
const main=fs.readFileSync('frontend/src/main.jsx','utf8');
const css=fs.readFileSync('frontend/src/styles.css','utf8');
const server=fs.readFileSync('backend/src/server.js','utf8');
const checks=[
 ['portal endpoint',server.includes("app.get('/api/portal/me'" )],
 ['student results',server.includes('data.results=')],
 ['student routine',server.includes('data.routine=')],
 ['student assignments',server.includes('data.assignments=')],
 ['student learning',server.includes('data.learning=')],
 ['portal notifications',server.includes('notifications:[]')],
 ['student portal results UI',main.includes('ফলাফল')&&main.includes('data.results')],
 ['student portal routine UI',main.includes('ক্লাস রুটিন')&&main.includes('data.routine')],
 ['assignment UI',main.includes('অ্যাসাইনমেন্ট')&&main.includes('submission_id')],
 ['learning UI',main.includes('ডিজিটাল লার্নিং')&&main.includes('content_url')],
 ['guardian result UI',main.includes('সাম্প্রতিক ফলাফল')],
 ['teacher assignment UI',main.includes('অ্যাসাইনমেন্ট ও জমা')],
 ['portal responsive CSS',css.includes('.portal-cards')&&css.includes('@media(max-width:560px)')],
 ['no placeholder fallback',!main.includes('TODO_PLACEHOLDER')]
];
let bad=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(!ok)bad++}
console.log(`V35 QA: ${checks.length-bad}/${checks.length} passed`); process.exit(bad?1:0);
