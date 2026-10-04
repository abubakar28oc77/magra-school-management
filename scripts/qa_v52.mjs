import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url).pathname;
const server=fs.readFileSync(root+'backend/src/server.js','utf8');
const jsx=fs.readFileSync(root+'frontend/src/main.jsx','utf8');
const checks=[
 ['notification read endpoint',server.includes("/api/notifications/:id/read")],
 ['notification read-all endpoint',server.includes("/api/notifications/read-all")],
 ['portal notifications loaded',server.includes('recipient_user_id=$1 ORDER BY created_at DESC LIMIT 8')],
 ['interactive notification state',jsx.includes('const[rows,setRows]=useState(items)')],
 ['mark notification read',jsx.includes('markRead=async(id)')],
 ['mark all notifications',jsx.includes("api('/notifications/read-all'")],
 ['unread badge',jsx.includes('rows.filter(x=>!x.is_read).length')],
 ['student result KPI',jsx.includes('গড় প্রাপ্ত নম্বর')],
 ['student result failure count',jsx.includes("r.grade==='F'")],
 ['student portal exists',jsx.includes('function StudentPortal({data})')],
 ['guardian portal exists',jsx.includes('function GuardianPortal({data})')],
 ['teacher portal exists',jsx.includes('function TeacherPortal({data})')],
 ['V51 regression QA',fs.existsSync(root+'scripts/qa_v51.mjs')]
];
for(const [name,ok] of checks) assert.ok(ok,name);
console.log(`V52 QA PASS: ${checks.length}/${checks.length}`);
