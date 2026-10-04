import fs from 'fs';
const backend=fs.readFileSync('backend/src/server.js','utf8');
const front=fs.readFileSync('frontend/src/main.jsx','utf8');
const checks=[
 ['health version V103',backend.includes("version:'V103'")],
 ['logout invalidates token version',backend.includes("app.post('/api/auth/logout'") && backend.includes("auth_token_version=auth_token_version+1")],
 ['password change requires relogin',backend.includes('relogin_required:true')],
 ['security sessions endpoint',backend.includes('/api/users/security-sessions')],
 ['invalidate sessions endpoint',backend.includes('/invalidate-sessions')],
 ['role protection on session invalidation',backend.includes("role_name==='super_admin' && req.user.role!=='super_admin'")],
 ['frontend security sessions panel',front.includes('SecuritySessionsPanel')],
 ['frontend sessions navigation',front.includes("['sessions','সেশন ও নিরাপত্তা']")],
 ['frontend relogin after password change',front.includes('d.relogin_required')],
 ['V102 provisioning retained',backend.includes('/api/users/provision-profile') && backend.includes('/api/users/provision-guardian-from-student')],
 ['admin reset retained',backend.includes('/reset-password')],
 ['activation retained',front.includes('toggle(u)')]
];
let pass=0; for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`); if(ok)pass++;}
console.log(`RESULT ${pass}/${checks.length}`); if(pass!==checks.length)process.exit(1);
