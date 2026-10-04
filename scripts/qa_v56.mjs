import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'frontend/src/styles.css','utf8');
const migrations=fs.readdirSync(root+'database/migrations').filter(x=>/^\d+_.+\.sql$/.test(x)).sort();
const nums=migrations.map(x=>Number(x.slice(0,3)));
const front=new Set([...jsx.matchAll(/api\(['\"](\/[^'\"]+)/g)].map(m=>m[1].split('?')[0]).concat([...jsx.matchAll(/api\(`(\/[^`$]+)/g)].map(m=>m[1].split('?')[0])));
const routes=new Set([...server.matchAll(/app\.(?:get|post|put|patch|delete)\(['\"](\/api\/[^'\"]+)/g)].map(m=>m[1]));
const norm=p=>p.replace(/\/\d+(?=\/|$)/g,'/:id').replace(/\/\/+?/g,'/').replace(/\/$/,'');
const routeNorm=new Set([...routes].map(norm));
const missing=[];
for(const p of front){const n=norm('/api'+p);if(!routeNorm.has(n) && !['/api/events','/api/online-exams/attempts'].includes(n))missing.push(p)}
const checks=[
 ['migration chain 006-023 present',nums.length===18&&nums.every((n,i)=>n===6+i)],
 ['learning API implemented',server.includes("app.get('/api/learning'")&&server.includes("app.post('/api/learning'")&&server.includes('learning_contents')],
 ['frontend learning contract',jsx.includes("api('/learning?published=')")&&jsx.includes("api('/learning',{method:'POST'")],
 ['frontend static API paths resolve',missing.length===0],
 ['school identity',server.includes("eiin: '114290'")&&server.includes('মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়')],
 ['leadership', ['নেয়ামুল হক খান','মুহাম্মদ শফিকুল ইসলাম','তাপসী সরকার','মুহাম্মদ আবুবকর সিদ্দিক'].every(x=>server.includes(x))],
 ['auth and session invalidation',server.includes('jwt.verify')&&server.includes('auth_token_version')],
 ['security middleware',server.includes('helmet(')&&server.includes("app.use('/api/', apiLimiter)")&&server.includes('loginLimiter')],
 ['assignment workflow',server.includes('/api/assignments/:id/submit')&&server.includes('/api/portal/teacher/assignment-submissions')],
 ['result and marks',server.includes('/api/results/process')&&server.includes('/api/marks/bulk')&&server.includes('/api/portal/teacher/marks-save')],
 ['transport hostel scholarship',server.includes('/api/transport/vehicles')&&server.includes('/api/hostel/rooms')&&server.includes('/api/scholarships')],
 ['notification read workflow',server.includes('/api/notifications/:id/read')&&server.includes('/api/notifications/read-all')],
 ['portals', ['StudentPortal','GuardianPortal','TeacherPortal'].every(x=>jsx.includes(`function ${x}`))],
 ['public view login',jsx.includes('function Home')&&jsx.includes('function Login')],
 ['PWA assets',fs.existsSync(root+'frontend/public/school-logo.png')&&fs.existsSync(root+'frontend/public/school-building.jpg')&&jsx.includes('PWA')],
 ['accessibility polish',css.includes('prefers-reduced-motion')&&css.includes('focus-visible')&&jsx.includes('skip-link')],
 ['backup restore',fs.existsSync(root+'scripts/backup.sh')&&fs.existsSync(root+'scripts/restore.sh')],
 ['error handling shutdown',server.includes('app.use(errorHandler)')&&server.includes('SIGTERM')&&server.includes('pool.end()')]
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`V56 Integration QA PASS: ${checks.length}/${checks.length}`);
console.log(`Frontend static API contract: ${front.size} paths checked, 0 unresolved`);
