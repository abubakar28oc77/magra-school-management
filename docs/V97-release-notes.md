# V97 — Document Generator bilingual refinement

V97 continues from V96.

### Included
- Added the language hook to the Document Generator so its UI follows the global বাংলা / English / বাংলা + English setting.
- Localized document selection controls, preview/print/issue actions, issued-document register headers, result summary labels, marksheet headers, merit/tabulation headers, and selected preview labels.
- Kept V96 features intact: Form Builder, Feature Control, Voter List, Village-wise Student List, and Commendation Certificate.

### Verification
- V97 targeted QA: 11/11 PASS.
- Backend syntax check: PASS (`node --check backend/src/server.js`).
- QA script syntax check: PASS.
- Full Vite production build, browser runtime, and live Supabase/PostgreSQL integration are still pending and are not claimed as certified.
