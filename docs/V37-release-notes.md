# V37 Release Notes

## Completed
- Fixed a production-impacting content CMS update bug: content edits now update by `req.params.id` instead of accidentally using `sort_order` as the row id.
- Added required-field validation to content updates.
- Expanded Guardian Portal data with per-student fee totals, payment totals, outstanding amount, fee details, and active assignments.
- Added Guardian Portal UI for fee/balance visibility and assignments.

## QA
- V37 automated checks: 10/10 PASS.
- Backend syntax check: PASS.
- Backup script syntax: PASS.
- Restore script syntax: PASS.

## Limitations
- PostgreSQL live integration and production deployment were not executed in this environment.
- Frontend dependency installation/build remains environment-dependent and was not certified here.
