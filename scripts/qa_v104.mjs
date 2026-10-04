import fs from 'fs';
const backend=fs.readFileSync('backend/src/server.js','utf8');
const handoff=fs.readFileSync('docs/PRODUCTION-HANDOFF.md','utf8');
const checks=[
 ['health version V104',backend.includes("version:'V104'")],
 ['startup version V104',backend.includes('Magra School API V104 running')],
 ['no req.user.role_name authorization references',!backend.includes('req.user.role_name')],
 ['learning role check normalized',backend.includes("if(req.user.role==='teacher')")],
 ['production migrations through 032',handoff.includes('006 through 032')],
 ['session invalidation in handoff',handoff.toLowerCase().includes('session invalidation')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok)pass++;}
console.log(`RESULT ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
