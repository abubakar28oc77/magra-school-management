# V34 Release Notes

## Result & Reporting analytics
- Added visual attendance trend, class attendance progress, finance bars, admission-rate reporting and student-risk badges.
- Added report-level Print / PDF action using browser print and print-specific CSS.
- Kept existing result, attendance, finance, admission and risk APIs as the data source.
- Preserved responsive layout and existing role-protected report access.

## QA
- Frontend source checks: 13/13 PASS
- Backend syntax: PASS
- Backup script syntax: PASS
- Restore script syntax: PASS
- ZIP integrity: PASS
- Full Vite production build remains environment-unverified because dependencies are not installed here.
- Live PostgreSQL integration remains environment-unverified because no PostgreSQL server is available in this environment.
