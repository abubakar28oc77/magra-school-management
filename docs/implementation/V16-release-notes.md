# V16 — Official Documents & Print

## Delivered
- Student ID Card preview/print
- Marksheet preview/print
- Progress Report preview/print
- Certificate preview/print
- Admit Card foundation
- Tabulation Sheet preview/print
- Merit List preview/print
- Document templates table and issued document audit trail
- Role-aware document APIs
- Student/guardian access restrictions for personal documents
- Official school logo and latest school building image packaged in frontend assets

## Verification
- Backend syntax: PASS (`node --check backend/src/server.js`)
- Package JSON parse: PASS
- Migration structural review: PASS
- ZIP/package integrity: PASS
- Frontend dependency/build: not certified in this environment because dependencies are not installed and network installation may time out.

## Production notes
- Final PDF rendering can use the browser print dialog (`Save as PDF`) for this milestone.
- Server-side PDF generation, document numbering policy, signatures/seals and institutional approval workflow remain part of final production hardening.
