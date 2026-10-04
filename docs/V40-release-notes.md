# V40 Release Notes

## Examination & Result hardening
- Added a maximum of 1,000 records per bulk marks request.
- Preserved component/full-mark validation for written, MCQ and practical marks.
- Restricted marksheet access for student accounts to their own record and guardian accounts to linked students.
- Added aggregate total, full marks, percentage, GPA and result status to marksheet/progress preview.
- Kept print/PDF workflow available from document preview.

## QA
`node scripts/qa_v40.mjs` validates 12 V40 checks. Live PostgreSQL integration and production deployment remain environment-dependent and are not claimed here.
