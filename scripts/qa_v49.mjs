import fs from 'fs';
const root=process.cwd();
const migration=fs.readFileSync(`${root}/database/migrations/022_scholarship_events_achievements.sql`,'utf8');
const backend=fs.readFileSync(`${root}/backend/src/server.js`,'utf8');
const frontend=fs.readFileSync(`${root}/frontend/src/main.jsx`,'utf8');
const checks=[
 ['scholarship_awards table',migration.includes('CREATE TABLE IF NOT EXISTS scholarship_awards')],
 ['scholarship amount validation',migration.includes('CHECK(amount>=0)')],
 ['event_participants table',migration.includes('CREATE TABLE IF NOT EXISTS event_participants')],
 ['event participant uniqueness',migration.includes('UNIQUE(content_id,student_id)')],
 ['scholarship list endpoint',backend.includes("app.get('/api/scholarships'")],
 ['scholarship create endpoint',backend.includes("app.post('/api/scholarships'")],
 ['scholarship update/delete endpoints',backend.includes("app.put('/api/scholarships/:id'")&&backend.includes("app.delete('/api/scholarships/:id'")],
 ['event participants endpoint',backend.includes("app.get('/api/events/:id/participants'")&&backend.includes("app.post('/api/events/:id/participants'")],
 ['duplicate participant protection',backend.includes("e.code==='23505'?'এই শিক্ষার্থী ইতোমধ্যে যুক্ত আছে'")],
 ['scholarship admin panel',frontend.includes('function ScholarshipPanel()')],
 ['event participant admin panel',frontend.includes('function EventParticipantsPanel()')],
 ['content tabs',frontend.includes("tab==='scholarship'")&&frontend.includes("tab==='participants'")],
];
let fail=0;for(const [name,ok] of checks){if(ok)console.log(`PASS - ${name}`);else{console.log(`FAIL - ${name}`);fail++;}}
console.log(`V49 QA: ${checks.length-fail}/${checks.length} PASS`);process.exit(fail?1:0);
