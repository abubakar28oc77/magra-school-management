import fs from 'node:fs';
const root=process.cwd();
const must=[
 ['database/migrations/027_navigation_hierarchy.sql',/ALTER TABLE system_features ADD COLUMN IF NOT EXISTS parent_key/],
 ['database/migrations/027_navigation_hierarchy.sql',/admin\.results\.marks/],
 ['database/migrations/027_navigation_hierarchy.sql',/public\.nav\.guide\.ai/],
 ['frontend/src/publicNavConfig.js',/public\.nav\.guide/],
 ['frontend/src/main.jsx',/function FeatureControlPanel/],
 ['frontend/src/main.jsx',/feature_control/],
 ['backend/src/server.js',/parent_key/]
];
let pass=0;for(const [f,re] of must){const ok=re.test(fs.readFileSync(f,'utf8'));console.log(`${ok?'PASS':'FAIL'} | ${f} | ${re}`);if(ok)pass++;}
const sql=fs.readFileSync('database/migrations/027_navigation_hierarchy.sql','utf8');
const admin=(sql.match(/'admin\.[^']+'/g)||[]).length;const pub=(sql.match(/'public\.nav\.[^']+'/g)||[]).length;
console.log(`PASS | hierarchical registry entries | admin=${admin} public=${pub}`);
if(pass!==must.length)process.exit(1);
