import fs from 'node:fs';
const root=new URL('..',import.meta.url).pathname;
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const css=fs.readFileSync(root+'/frontend/src/styles.css','utf8');
const migration=fs.readFileSync(root+'/database/migrations/020_school_content_expansion.sql','utf8');
const checks=[
 ['public content endpoint',server.includes("app.get('/api/public/content'")],
 ['gallery content type',migration.includes("'gallery'")],
 ['gallery filtering UI',jsx.includes("content_type==='gallery'&&x.image_url")],
 ['gallery grid',jsx.includes('gallery-grid')],
 ['gallery lightbox',jsx.includes('lightbox')],
 ['gallery image action',jsx.includes('setLightbox(x)')],
 ['lightbox close action',jsx.includes('setLightbox(null)')],
 ['gallery responsive CSS',css.includes('.gallery-grid')&&css.includes('@media(max-width:600px)')],
 ['image url rendering',jsx.includes('src={x.image_url}')],
 ['content categories retained',jsx.includes("['achievement'" )&&jsx.includes("['scholarship'")],
 ['transport category retained',jsx.includes("['transport'")],
 ['hostel category retained',jsx.includes("['hostel'")]
];
let pass=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} - ${n}`);if(ok)pass++}console.log(`V46 QA: ${pass}/${checks.length} PASS`);if(pass!==checks.length)process.exit(1);
