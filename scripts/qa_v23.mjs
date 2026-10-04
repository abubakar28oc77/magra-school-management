import fs from 'fs';
import path from 'path';
const root=process.cwd(); let pass=0,fail=0;
function check(name,ok){console.log(`${ok?'PASS':'FAIL'}  ${name}`);ok?pass++:fail++}
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const schema=fs.readFileSync(path.join(root,'database/migrations/018_routine_integrity.sql'),'utf8');
const ui=fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8');
check('routine GET endpoint',server.includes("app.get('/api/routines'"));
check('routine POST endpoint',server.includes("app.post('/api/routines'"));
check('routine PUT endpoint',server.includes("app.put('/api/routines/:id'"));
check('routine DELETE endpoint',server.includes("app.delete('/api/routines/:id'"));
check('routine overlap time validation',server.includes("start_time)>=String(x.end_time)"));
check('routine audit logging',server.includes("audit(req.user.sub,'create','routine'"));
check('routine integrity migration',schema.includes('uq_routine_exact_slot'));
check('routine teacher join',server.includes('LEFT JOIN teachers t ON t.id=r.teacher_id'));
check('routine UI exists',ui.includes('function RoutinePanel()'));
check('routine UI wired',ui.includes("active==='routine'&&<RoutinePanel/>") && ui.includes("'results','routine','users'"));
check('teacher portal uses room field',ui.includes("r.room||'—'"));
console.log(`V23 static QA: ${pass}/${pass+fail} passed`); if(fail) process.exit(1);
