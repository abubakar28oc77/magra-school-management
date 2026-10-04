import fs from 'fs';
import path from 'path';
const root=path.resolve(new URL('.',import.meta.url).pathname,'..');
const main=fs.readFileSync(path.join(root,'frontend/src/main.jsx'),'utf8');
const css=fs.readFileSync(path.join(root,'frontend/src/styles.css'),'utf8');
const server=fs.readFileSync(path.join(root,'backend/src/server.js'),'utf8');
const checks=[
 ['Dedicated /login route exists', main.includes('location.pathname==="/login"')],
 ['Header login navigates to /login', main.includes('href="/login"')],
 ['Login loading state', main.includes('setLoading(true)') && main.includes('setLoading(false)')],
 ['Login button disabled while loading', main.includes('disabled={loading}')],
 ['Login status aria-live', main.includes('aria-live="polite"')],
 ['Password visibility control retained', main.includes('setShow(!show)')],
 ['Password reset guidance retained', main.includes('Password reset করুন')],
 ['Back-to-site link', main.includes('className="login-back"')],
 ['Final 1→2→3→4 public structure retained', main.includes('ref-hero') && main.includes('ref-bottom')],
 ['EIIN 114290 retained', main.includes('114290')],
 ['School logo retained', main.includes('school-logo.png')],
 ['School building retained', main.includes('school-building.jpg')],
 ['V81 backend version', server.includes('V81')],
 ['Login action styling', css.includes('.login-actions')],
 ['Disabled login styling', css.includes('.login-submit:disabled')],
 ['Mobile login shell retained', css.includes('.login-shell{grid-template-columns:1fr;gap:28px}')]
];
let pass=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok)pass++;}
console.log(`RESULT ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
