import fs from 'fs';
const nav=fs.readFileSync('frontend/src/publicNavConfig.js','utf8');
const main=fs.readFileSync('frontend/src/main.jsx','utf8');
const css=fs.readFileSync('frontend/src/styles.css','utf8');
const checks=[
 ['Contact dropdown', nav.includes("public.nav.contact.head") && nav.includes("public.nav.contact.office")],
 ['Science/ICT/language/debate clubs', main.includes('বিজ্ঞান ক্লাব')&&main.includes('আইসিটি ক্লাব')&&main.includes('ভাষা ও সাহিত্য ক্লাব')&&main.includes('ডিবেটিং ক্লাব')],
 ['Demographic cards', main.includes('ref-demographic-stats')&&css.includes('.ref-demographic-card')],
 ['Emergency services', main.includes('333')&&main.includes('999')&&main.includes('1098')&&main.includes('1090')],
 ['Contact directory', main.includes('contactPeople')&&main.includes('contact-ict')&&main.includes('contact-office')],
 ['Student count 600+', main.includes('<strong>৬০০+</strong>')],
 ['Responsive styles', css.includes('@media(max-width:650px)')&&css.includes('.club-grid')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'}: ${n}`); if(ok)pass++;}
if(pass!==checks.length) process.exit(1); console.log(`V110 Public Home QA: ${pass}/${checks.length} PASS`);
