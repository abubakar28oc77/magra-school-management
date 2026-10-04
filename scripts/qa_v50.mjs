import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const jsx=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'frontend/src/styles.css','utf8');
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const checks=[
 ['public content API',server.includes("app.get('/api/public/content'")],
 ['public search UI',jsx.includes('বিদ্যালয়ের তথ্য খুঁজুন')],
 ['content filters',jsx.includes('content-filter-chips')],
 ['gallery lightbox',jsx.includes('className="lightbox"')],
 ['contact section',jsx.includes('id="contact"')],
 ['school identity EIIN',jsx.includes('EIIN 114290')],
 ['school email',jsx.includes('magrapuhs.46@gmail.com')],
 ['responsive contact CSS',css.includes('.contact-grid')&&css.includes('@media(max-width:760px)')],
 ['scholarship migration',fs.existsSync(root+'database/migrations/022_scholarship_events_achievements.sql')],
 ['V49 regression QA',fs.existsSync(root+'scripts/qa_v49.mjs')]
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`V50 QA PASS: ${checks.length}/${checks.length}`);
