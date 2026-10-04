import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const migrations=fs.readdirSync(root+'database/migrations').filter(x=>/^\d+_.+\.sql$/.test(x)).sort();
const nums=migrations.map(x=>Number(x.slice(0,3)));
const checks=[
 ['migration chain 006-023 present', nums.length===18 && nums.every((n,i)=>n===6+i)],
 ['school EIIN 114290', server.includes("eiin: '114290'")],
 ['school leadership configured', ['নেয়ামুল হক খান','মুহাম্মদ শফিকুল ইসলাম','তাপসী সরকার','মুহাম্মদ আবুবকর সিদ্দিক'].every(x=>server.includes(x))],
 ['authentication and RBAC', server.includes('jwt.verify')&&server.includes('const allow =')],
 ['session invalidation', server.includes('auth_token_version')],
 ['rate limiting', server.includes("app.use('/api/', apiLimiter)")&&server.includes('loginLimiter')],
 ['notifications workflow', server.includes("/api/notifications/:id/read")&&server.includes("/api/notifications/read-all")],
 ['attendance workflow', server.includes("/api/attendance/report")],
 ['result processing', server.includes("/api/results/process")&&server.includes("/api/marks/bulk")],
 ['finance and library modules', server.includes('/api/finance/fees')&&server.includes('/api/library/books')],
 ['learning and online exam', server.includes('learning_contents')&&server.includes('/api/online-exams')],
 ['AI education endpoints', server.includes('/api/ai/')],
 ['transport capacity validation', server.includes('যানবাহনের ধারণক্ষমতা কমপক্ষে ১')],
 ['hostel capacity validation', server.includes('কক্ষের ধারণক্ষমতা কমপক্ষে ১')],
 ['transport and hostel routes', server.includes('/api/transport/vehicles')&&server.includes('/api/hostel/rooms')],
 ['scholarship and event routes', server.includes('/api/scholarships')&&server.includes('/events/:id/participants')],
 ['assignment submission workflow', server.includes('/api/assignments/:id/submit')&&server.includes('/api/portal/teacher/assignment-submissions')],
 ['portal components', ['StudentPortal','GuardianPortal','TeacherPortal'].every(x=>jsx.includes(`function ${x}`))],
 ['public view and login', jsx.includes('function Home')&&jsx.includes('function Login')],
 ['PWA support', fs.existsSync(root+'frontend/vite.config.js')&&jsx.includes('PWA')],
 ['health version V53', server.includes("version:'V53'")&&server.includes('Magra School API V53')],
 ['error handler mounted', server.includes('app.use(errorHandler)')]
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`V53 Integration QA PASS: ${checks.length}/${checks.length}`);
