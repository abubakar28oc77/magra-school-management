import fs from 'fs';
const main=fs.readFileSync('frontend/src/main.jsx','utf8');
const i18n=fs.readFileSync('frontend/src/i18n.js','utf8');
const css=fs.readFileSync('frontend/src/styles.css','utf8');
const nav=fs.readFileSync('frontend/src/publicNavConfig.js','utf8');
const checks=[
 ['i18n module',i18n.includes('LanguageProvider')&&i18n.includes('LanguageSwitcher')],
 ['language persistence',i18n.includes("localStorage.setItem('magra_lang'")],
 ['three language modes',i18n.includes("key:'bn'")&&i18n.includes("key:'en'")&&i18n.includes("key:'bi'")],
 ['public language switcher',main.includes('<LanguageSwitcher/>')],
 ['admin language switcher',main.includes('admin-top-actions')&&main.includes('<LanguageSwitcher/>')],
 ['English public navigation',main.includes('NAV_EN')&&main.includes('Sports & Culture')],
 ['English admin navigation',main.includes('adminEn')&&main.includes('Marks Entry')],
 ['bilingual secondary labels',css.includes('.lang-secondary')&&i18n.includes('lang-secondary')],
 ['form builder English labels',main.includes('label_en')&&main.includes('English name')],
 ['public nav registry',nav.includes('public.nav.home')],
 ['voter/village/commendation migration',fs.existsSync('database/migrations/030_voter_village_commendation.sql')]
];
let pass=0;for(const [n,ok] of checks){console.log((ok?'PASS':'FAIL')+' - '+n);if(ok)pass++;}
console.log(`V93 QA: ${pass}/${checks.length} PASS`);
process.exitCode=pass===checks.length?0:1;
