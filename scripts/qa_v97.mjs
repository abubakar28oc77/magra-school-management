import fs from 'node:fs';
const s=fs.readFileSync('frontend/src/main.jsx','utf8');
const checks=[
 ['DocumentPanel language hook', s.includes('function DocumentPanel({sub})') && s.includes('const {lang}=useLanguage();')],
 ['Document selection localization', s.includes('Select Student') && s.includes('Select Class') && s.includes('Select Exam')],
 ['Issued document localization', s.includes('Issued Documents') && s.includes('Document No.')],
 ['Result summary localization', s.includes('Percentage') && s.includes("docLabel('ফলাফল','Result')")],
 ['Marks/merit headers localized', s.includes("docLabel('বিষয়','Subject')") && s.includes("docLabel('মেধা','Merit')")],
 ['Form Builder retained', s.includes('FormBuilderPanel')],
 ['Feature Control retained', s.includes('FeatureControlPanel')],
 ['Voter endpoint retained', s.includes('/voter-list?q=')],
 ['Village-wise endpoint retained', s.includes('/students/village-wise?village=')],
 ['Commendation document retained', s.includes("commendation_certificate")],
 ['Bilingual document types retained', s.includes('Student ID Card') && s.includes('Commendation Certificate')]
];
let failed=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)failed++;}console.log(`RESULT ${checks.length-failed}/${checks.length}`);process.exitCode=failed?1:0;
