import fs from 'fs';
const root=new URL('..',import.meta.url).pathname.replace(/\/$/,'');
const migration=fs.readFileSync(root+'/database/migrations/021_transport_hostel.sql','utf8');
const server=fs.readFileSync(root+'/backend/src/server.js','utf8');
const front=fs.readFileSync(root+'/frontend/src/main.jsx','utf8');
const checks=[
 ['transport vehicles table',migration.includes('CREATE TABLE IF NOT EXISTS transport_vehicles')],
 ['transport assignments table',migration.includes('CREATE TABLE IF NOT EXISTS transport_assignments')],
 ['transport capacity guard',server.includes('যানবাহনের আসন পূর্ণ')],
 ['transport assignment endpoint',server.includes("app.post('/api/transport/assignments'")],
 ['hostel rooms table',migration.includes('CREATE TABLE IF NOT EXISTS hostel_rooms')],
 ['hostel assignments table',migration.includes('CREATE TABLE IF NOT EXISTS hostel_assignments')],
 ['hostel capacity guard',server.includes('কক্ষের ধারণক্ষমতা পূর্ণ')],
 ['hostel assignment endpoint',server.includes("app.post('/api/hostel/assignments'")],
 ['transport admin module',front.includes("['পরিবহন','transport']")],
 ['hostel admin module',front.includes("['হোস্টেল','hostel']")],
 ['transport panel',front.includes('function TransportPanel()')],
 ['hostel panel',front.includes('function HostelPanel()')]
];
let pass=0; for(const [n,ok] of checks){console.log((ok?'PASS':'FAIL')+' - '+n); if(ok)pass++;}
console.log(`V48 QA: ${pass}/${checks.length} PASS`); if(pass!==checks.length)process.exit(1);
