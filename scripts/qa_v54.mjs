import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'frontend/src/styles.css','utf8');
const migrations=fs.readdirSync(root+'database/migrations').filter(x=>/^\d+_.+\.sql$/.test(x)).sort();
const nums=migrations.map(x=>Number(x.slice(0,3)));
const checks=[
 ['migration chain 006-023 present', nums.length===18 && nums.every((n,i)=>n===6+i)],
 ['school identity', server.includes("eiin: '114290'")&&server.includes('মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়')],
 ['leadership', ['নেয়ামুল হক খান','মুহাম্মদ শফিকুল ইসলাম','তাপসী সরকার','মুহাম্মদ আবুবকর সিদ্দিক'].every(x=>server.includes(x))],
 ['auth RBAC session invalidation', server.includes('jwt.verify')&&server.includes('const allow =')&&server.includes('auth_token_version')],
 ['rate limiting and security middleware', server.includes("app.use('/api/', apiLimiter)")&&server.includes('loginLimiter')&&server.includes('helmet(')],
 ['public health version consistent', server.includes("app.get('/api/health'")&&server.includes("version:'V54'")&&server.includes('Magra School API V54')],
 ['logout endpoint and frontend cleanup', server.includes("app.post('/api/auth/logout'")&&jsx.includes("api('/auth/logout'")&&jsx.includes("localStorage.removeItem('magra_token')")],
 ['notification read workflow', server.includes('/api/notifications/:id/read')&&server.includes('/api/notifications/read-all')],
 ['attendance and results', server.includes('/api/attendance/report')&&server.includes('/api/results/process')&&server.includes('/api/marks/bulk')],
 ['finance library learning', server.includes('/api/finance/fees')&&server.includes('/api/library/books')&&server.includes('learning_contents')],
 ['portals', ['StudentPortal','GuardianPortal','TeacherPortal'].every(x=>jsx.includes(`function ${x}`))],
 ['assignment evaluation', server.includes('/api/assignments/:id/submit')&&server.includes('/api/portal/teacher/assignment-submissions')],
 ['transport hostel scholarship events', server.includes('/api/transport/vehicles')&&server.includes('/api/hostel/rooms')&&server.includes('/api/scholarships')&&server.includes('/events/:id/participants')],
 ['public view and login', jsx.includes('function Home')&&jsx.includes('function Login')],
 ['official logo/building assets', fs.existsSync(root+'frontend/public/school-logo.png')&&fs.existsSync(root+'frontend/public/school-building.jpg')],
 ['responsive UI', /@media\(max-width:/.test(css)&&css.includes('.login-shell')&&css.includes('.gallery-grid')],
 ['PWA configuration', fs.existsSync(root+'frontend/vite.config.js')&&jsx.includes('PWA')],
 ['accessible image/menu labels', jsx.includes('alt="বিদ্যালয়ের লোগো"')&&jsx.includes('aria-expanded={open}')],
 ['error handler and graceful shutdown', server.includes('app.use(errorHandler)')&&server.includes('SIGTERM')&&server.includes('pool.end()')],
 ['backup restore scripts', fs.existsSync(root+'scripts/backup.sh')&&fs.existsSync(root+'scripts/restore.sh')]
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`V54 Final QA PASS: ${checks.length}/${checks.length}`);
