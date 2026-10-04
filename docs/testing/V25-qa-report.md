# V25 QA Report

## Scope
Final functional hardening pass before visual redesign.

## Static checks
- Backend syntax: PASS
- QA checks: 13/13 PASS
- Backup script syntax: PASS
- Restore script syntax: PASS
- ZIP integrity: PASS

## Functional hardening
- Online exam start respects published schedule windows.
- Online exam submission only scores questions attached to the selected exam.
- Online exam score is capped by exam total marks.
- Attendance guardian alerts are deduplicated per student/guardian/day.
- Guardian mapping uses guardian_student_links.
- Session version invalidation remains enforced.

## Environment limitation
Live PostgreSQL integration and browser production build require a staging/production environment with PostgreSQL and installed frontend dependencies.
