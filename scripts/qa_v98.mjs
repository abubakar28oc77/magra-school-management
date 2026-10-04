import fs from 'node:fs';
const p='frontend/src/main.jsx'; const s=fs.readFileSync(p,'utf8');
let pass=0,total=0;
function check(name,ok){total++; if(ok){pass++; console.log('PASS',name)} else console.log('FAIL',name)}
const a=s.indexOf('function DocumentPanel'); const b=s.indexOf('function RoutinePanel',a); const d=s.slice(a,b);
check('Bilingual print helper',/const L=\(bn,en\)=>lang==='en'\?en:lang==='bi'\?`\$\{bn\} \/ \$\{en\}`:bn/.test(d));
check('Print uses bilingual school/student names',/const studentName=val\(student\.name_bn,student\.name_en\);const schoolName=val\(school\.nameBn,school\.nameEn\|\|school\.name_bn\)/.test(d));
check('ID card print bilingual',/L\('শিক্ষার্থী পরিচয়পত্র','Student ID Card'\)/.test(d));
check('Certificate print bilingual',/Commendation Certificate.*Certificate/.test(d));
check('Admit card print bilingual',/L\('প্রবেশপত্র','Admit Card'\)/.test(d));
check('Marksheet print bilingual headings',/L\('বিষয়','Subject'\).*L\('পূর্ণমান','Full Marks'\).*L\('মোট','Total'\)/s.test(d));
check('Tabulation/Merit print bilingual',/L\('মেধা','Merit'\).*L\('রোল','Roll'\).*L\('ফলাফল','Result'\)/s.test(d));
check('Preview certificate bilingual',/docLabel\('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে','This is to certify that'\)/.test(d));
check('Issued document count localized',/issued\.length\} \{docLabel\('টি','items'\)\}/.test(d));
check('V96 features retained',/FormBuilderPanel/.test(s)&&/FeatureControlPanel/.test(s)&&/voter-list/.test(s)&&/village-wise/.test(s));
console.log(`V98 QA: ${pass}/${total}`); if(pass!==total)process.exit(1);
