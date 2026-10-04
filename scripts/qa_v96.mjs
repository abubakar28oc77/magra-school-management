import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const main = fs.readFileSync(root.replace(/\\/g,'/') + '/frontend/src/main.jsx','utf8');
const checks = [
 ['DocumentPanel bilingual helper', main.includes("const docLabel=(bn,en)=>lang==='en'?")],
 ['Bilingual document types', main.includes('Student ID Card') && main.includes('Commendation Certificate') && main.includes('Tabulation Sheet')],
 ['Voter list endpoint', main.includes('/voter-list?q=')],
 ['Village-wise endpoint', main.includes('/students/village-wise')],
 ['Form Builder retained', main.includes('FormBuilderPanel')],
 ['Feature Control retained', main.includes('FeatureControlPanel')]
];
let pass=0; for(const [name,ok] of checks){ console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok) pass++; }
console.log(`V96 QA: ${pass}/${checks.length}`);
if(pass!==checks.length) process.exit(1);
