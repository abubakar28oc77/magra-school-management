import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'/frontend/src/styles.css','utf8');
const checks=[
 ['content type validation',server.includes("const types=['event','achievement','scholarship','facility','institution','sport','gallery','transport','hostel','club','library_info']")],
 ['content status validation',server.includes("const statuses=['published','draft','archived']")],
 ['title length validation',server.includes("length>200")],
 ['content search filter',jsx.includes("[r.title_bn,r.title_en,r.description,r.location]")],
 ['content type filter',jsx.includes('typeFilter')],
 ['filtered content rendering',jsx.includes('{visible.map(r=><tr')],
 ['gallery retained',jsx.includes("content_type==='gallery'&&x.image_url")],
 ['gallery lightbox retained',jsx.includes('setLightbox(x)')],
 ['transport retained',jsx.includes("['transport'")],
 ['hostel retained',jsx.includes("['hostel'")],
 ['scholarship retained',jsx.includes("['scholarship'")],
 ['preview css hook',jsx.includes('content-form-preview')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`); if(ok)pass++;}
console.log(`V47 QA: ${pass}/${checks.length} PASS`); if(pass!==checks.length) process.exit(1);
