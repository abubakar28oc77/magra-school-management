import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const checks=[];
function ok(name,pass,detail=''){checks.push({name,pass,detail});}
function has(file,needle){return fs.readFileSync(path.join(root,file),'utf8').includes(needle)}

ok('Reference image 01 exists',fs.existsSync(path.join(root,'docs/ui-reference/reference-01-top.jpg')));
ok('Reference image 02 exists',fs.existsSync(path.join(root,'docs/ui-reference/reference-02-notice-links.jpg')));
ok('Reference plan documents top-to-bottom rule',has('docs/ui-reference/reference-plan.md','After all 7 are received'));
ok('Public navigation config exists',fs.existsSync(path.join(root,'frontend/src/publicNavConfig.js')));
ok('Navigation contains institutional submenu',has('frontend/src/publicNavConfig.js','প্রাতিষ্ঠানিক তথ্য'));
ok('Navigation contains sports/culture submenu',has('frontend/src/publicNavConfig.js','ক্রীড়া ও সংস্কৃতি'));
ok('Navigation contains student guide submenu',has('frontend/src/publicNavConfig.js','শিক্ষার্থীর গাইড'));
ok('Navigation keeps Login explicit',has('frontend/src/publicNavConfig.js',"label:'লগইন'"));
ok('Backend health version is V60',has('backend/src/server.js',"version:'V60'"));
ok('Actual school EIIN remains 114290 in frontend',has('frontend/src/main.jsx','EIIN 114290'));
ok('Reference EIIN is not copied into frontend',!has('frontend/src/main.jsx','114282'));

for(const c of checks) console.log(`${c.pass?'PASS':'FAIL'} | ${c.name}${c.detail?' | '+c.detail:''}`);
const passed=checks.filter(x=>x.pass).length;
console.log(`RESULT ${passed}/${checks.length}`);
if(passed!==checks.length) process.exit(1);
