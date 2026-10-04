# V68 Release Notes

## Portal & learning security polish
- Added a teacher ownership guard to digital-learning content creation: a teacher may publish content only for a class where the teacher has a routine/teaching assignment.
- Preserved head teacher/admin/super admin management access.
- Added QA checks for student learning feed, guardian performance summary, teacher marks/assignment tools, and teacher learning ownership.

## Validation
- V67 regression audit: 21/21 PASS before V68 changes.
- V68 static audit includes the V67 checks plus the new portal/security checks.
- PostgreSQL live integration and a production Vite build remain environment-dependent and are not claimed as certified here.
