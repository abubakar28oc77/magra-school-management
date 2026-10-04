import fs from 'fs';
const root=new URL('..',import.meta.url).pathname;
const main=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'/frontend/src/styles.css','utf8');
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const mig=fs.readFileSync(root+'/database/migrations/019_co_curricular_content.sql','utf8');
const checks=[
 ['V28 source not duplicated', (main.match(/^import React/gm)||[]).length===1],
 ['public content section',main.includes('PublicContentSection')&&main.includes('SCHOOL LIFE')],
 ['content admin module',main.includes("['সহশিক্ষা ও অর্জন','content']")&&main.includes("active==='content'")],
 ['content CRUD API',server.includes("app.get('/api/content'")&&server.includes("app.post('/api/content'")&&server.includes("app.put('/api/content/:id'")&&server.includes("app.delete('/api/content/:id'")],
 ['public content API',server.includes("app.get('/api/public/content'")],
 ['content migration',mig.includes('school_content_items')&&mig.includes("content_type VARCHAR(30)")],
 ['V29 health',server.includes("version:'V29'")],
 ['content styling',css.includes('.content-public-grid')],
 ['leadership names',main.includes('নেয়ামুল হক খান')&&main.includes('মুহাম্মদ শফিকুল ইসলাম')&&main.includes('তাপসী সরকার')],
 ['school EIIN',main.includes('EIIN 114290')],
 ['backup script',fs.existsSync(root+'/scripts/backup.sh')],
 ['restore script',fs.existsSync(root+'/scripts/restore.sh')]
];
let bad=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)bad++}console.log(`${checks.length-bad}/${checks.length} checks passed`);if(bad)process.exit(1);
