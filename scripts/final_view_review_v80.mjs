import fs from 'fs';
const main=fs.readFileSync('frontend/src/main.jsx','utf8');
const css=fs.readFileSync('frontend/src/styles.css','utf8');
const nav=fs.readFileSync('frontend/src/publicNavConfig.js','utf8');
const checks=[
 ['Header uses block layout so topbar/header/nav stack correctly', /\.site-header\{display:block;/.test(css)],
 ['Final public nav marker retained', /4 final reference sections \(1→2→3→4\)/.test(nav)],
 ['School logo asset referenced', /school-logo\.png/.test(main)],
 ['School building asset referenced', /school-building\.jpg/.test(main)],
 ['EIIN 114290 retained', /114290/.test(main)],
 ['Leadership names retained', ['নেয়ামুল হক খান','মুহাম্মদ শফিকুল ইসলাম','তাপসী সরকার','মুহাম্মদ আবুবকর সিদ্দিক'].every(x=>main.includes(x))],
 ['Reference 3 statistics block present', /ref-stats/.test(main) && /৫০৫\+/.test(main) && /১৫/.test(main) && /৬–১০/.test(main)],
 ['Services section present', /id="services"/.test(main)],
 ['Notice board present', /id="notice"/.test(main)],
 ['Important/board links present', /শিক্ষা বোর্ডসমূহ/.test(main)],
 ['Leadership sidebar present', /ref-sidebar/.test(main) && /সভাপতির বাণী/.test(main)],
 ['About section present', /id="school-info"/.test(main)],
 ['Teacher section present', /id="teachers"/.test(main)],
 ['Distinguished students section present', /id="distinguished"/.test(main)],
 ['Gallery lightbox present', /ref-lightbox/.test(main)],
 ['Footer present', /ref-bottom/.test(main)],
 ['Mobile statistics layout present', /\.ref-stats\{grid-template-columns:repeat\(2,1fr\)/.test(css)],
 ['No javascript: URLs', !/javascript:/i.test(main)],
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`FINAL VIEW REVIEW V80: ${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
