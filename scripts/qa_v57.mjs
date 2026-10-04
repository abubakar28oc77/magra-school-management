import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const css = fs.readFileSync(path.join(root,'frontend/src/styles.css'),'utf8');
const jsx = fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8');
const server = fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const checks = [];
const ok=(name,pass,detail='')=>checks.push({name,pass,detail});

ok('Invalid portal @media selector removed', !/\.\@media\s*\(/.test(css));
ok('Reduced-motion support present', /prefers-reduced-motion/.test(css));
ok('Keyboard focus-visible support present', /focus-visible/.test(css));
ok('Skip navigation present', /skip-link/.test(jsx) && /main-content/.test(jsx));
ok('Public navigation has aria state', /aria-expanded=\{open\}/.test(jsx));
ok('Login username autocomplete', /autoComplete="username"/.test(jsx));
ok('Login password autocomplete', /autoComplete="current-password"/.test(jsx));
ok('School logo alt text', /alt="বিদ্যালয়ের লোগো"/.test(jsx));
ok('Building alt text', /alt="মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়ের ভবন"/.test(jsx));
ok('API version V57', /version:'V57'/.test(server));
ok('Logout endpoint present', /\/auth\/logout/.test(server));

let passed=0;
for(const c of checks){console.log(`${c.pass?'PASS':'FAIL'} | ${c.name}${c.detail?' | '+c.detail:''}`);if(c.pass)passed++;}
console.log(`SUMMARY ${passed}/${checks.length} PASS`);
if(passed!==checks.length) process.exit(1);
