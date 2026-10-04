import fs from 'node:fs';
const front=fs.readFileSync('frontend/src/main.jsx','utf8');
const back=fs.readFileSync('backend/src/server.js','utf8');
const mig=fs.readFileSync('database/migrations/020_school_content_expansion.sql','utf8');
const checks=[
 ['expanded content types', ['institution','sport','gallery','transport','hostel','club','library_info'].every(x=>mig.includes(`'${x}'`))],
 ['image_url migration', mig.includes('ADD COLUMN IF NOT EXISTS image_url')],
 ['public image field', back.includes('image_url,sort_order')],
 ['create image field', back.includes('image_url,status,sort_order,created_by')],
 ['update image field', back.includes('location=$6,image_url=$7')],
 ['public institution section', front.includes("['institution','🏛️','বিদ্যালয় পরিচিতি']")],
 ['public sports section', front.includes("['sport','⚽','ক্রীড়া ও সংস্কৃতি']")],
 ['public gallery section', front.includes("['gallery','🖼️','গ্যালারি']")],
 ['public transport section', front.includes("['transport','🚌','পরিবহন']")],
 ['public hostel section', front.includes("['hostel','🛏️','হোস্টেল']")],
 ['CMS image URL', front.includes('ছবির URL')],
 ['CMS expanded types', front.includes("['library_info','লাইব্রেরি তথ্য']")],
 ['image rendering', front.includes('content-thumb')],
 ['school identity', front.includes('EIIN 114290')],
];
let pass=0; for(const [n,ok] of checks){console.log((ok?'PASS':'FAIL'),n); if(ok)pass++;}
if(pass!==checks.length)process.exit(1); console.log(`V36 QA PASS: ${pass}/${checks.length}`);
