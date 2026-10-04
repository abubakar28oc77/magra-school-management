import fs from 'fs';
import path from 'path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const migrationDir = path.join(root, 'database', 'migrations');
const server = fs.readFileSync(path.join(root, 'backend', 'src', 'server.js'), 'utf8');
const m019 = fs.readFileSync(path.join(migrationDir, '019_co_curricular_content.sql'), 'utf8');
const migrations = fs.readdirSync(migrationDir).filter(f => /^\d+_.*\.sql$/.test(f)).sort();
let pass = 0, fail = 0;
function check(name, ok){ console.log(`${ok?'PASS':'FAIL'} | ${name}`); ok ? pass++ : fail++; }

check('Migration 019 uses UUID for users.created_by', /created_by UUID REFERENCES users\(id\)/.test(m019));
check('No migration defines BIGINT foreign key to users(id)', !migrations.some(f => /created_by BIGINT[^\n]*REFERENCES users\(id\)/.test(fs.readFileSync(path.join(migrationDir,f),'utf8'))));
check('Migration numbering is contiguous 006-023', JSON.stringify(migrations.map(f=>Number(f.slice(0,3)))) === JSON.stringify(Array.from({length:18},(_,i)=>i+6)));
check('Health endpoint reports V58', server.includes("/api/health") && server.includes("version:'V58'"));
check('Readiness endpoint reports V58', server.includes("/ready") && server.includes("version:'V58'"));
check('Production env requires DATABASE_URL', fs.readFileSync(path.join(root,'backend','src','security.js'),'utf8').includes('DATABASE_URL is required in production'));
check('Production env rejects weak JWT_SECRET', fs.readFileSync(path.join(root,'backend','src','security.js'),'utf8').includes('JWT_SECRET must be a strong 32+ character secret in production'));
check('Production env requires HTTPS CORS origins', fs.readFileSync(path.join(root,'backend','src','security.js'),'utf8').includes('CORS_ORIGIN must contain explicit HTTPS origins in production'));
check('Error responses include requestId', fs.readFileSync(path.join(root,'backend','src','security.js'),'utf8').includes('requestId: req.requestId'));
check('Transport capacity must be at least 1', server.includes('যানবাহনের ধারণক্ষমতা কমপক্ষে ১ হতে হবে'));
check('Assignment feedback route exists', server.includes('/api/assignments/:id/submit') && server.includes('/api/portal/teacher/assignment-submissions'));
console.log(`SUMMARY ${pass}/${pass+fail} PASS`);
if(fail) process.exit(1);
