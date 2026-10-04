import fs from 'node:fs';
const server=fs.readFileSync('backend/src/server.js','utf8');
const checks=[
 ['online exam start checks schedule', server.includes("পরীক্ষা এখনও শুরু হয়নি") && server.includes("পরীক্ষার সময় শেষ হয়েছে")],
 ['online exam only scores attached questions', server.includes('FROM online_exam_questions oq JOIN question_bank qb') && server.includes('allowedMap')],
 ['online exam score capped', server.includes('score=Math.min(score,Number(at.total_marks||score))')],
 ['attendance alerts deduplicated', server.includes("entity_type='student'") && server.includes('created_at::date=CURRENT_DATE')],
 ['guardian links used', server.includes('guardian_student_links')],
 ['notification role query uses roles table', server.includes('r.name role_name,r.label_bn')],
 ['session version enforcement', server.includes('auth_token_version') && server.includes('stale session')],
 ['password change required guard', server.includes('PASSWORD_CHANGE_REQUIRED')],
 ['health/readiness routes', server.includes("app.get('/health'") && server.includes("app.get('/ready'")],
 ['PWA configuration', fs.readFileSync('frontend/vite.config.js','utf8').includes('VitePWA')],
 ['school building asset', fs.existsSync('frontend/public/school-building.jpg')],
 ['backup and restore scripts', fs.existsSync('scripts/backup.sh') && fs.existsSync('scripts/restore.sh')],
 ['routine migration', fs.existsSync('database/migrations/018_routine_integrity.sql')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok) pass++;}
console.log(`RESULT ${pass}/${checks.length}`); if(pass!==checks.length) process.exit(1);
