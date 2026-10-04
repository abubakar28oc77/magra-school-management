# V41 Release Notes — Teacher Portal Attendance

## Added
- Added a role-scoped teacher portal roster endpoint: `/api/portal/teacher/roster`.
- Teachers can load an assigned class roster for a selected date.
- A normal teacher can only access classes that appear in their routine assignment.
- Head Teacher and Assistant Head Teacher roles can use the same teacher-tool view.
- Added quick attendance controls in the teacher portal: Present, Absent, Late.
- Added save-to-attendance workflow using the existing bulk attendance endpoint.
- Added responsive attendance action styling.

## Security
- Teacher roster access is protected by authentication and role checks.
- Normal teachers are prevented from viewing attendance rosters for classes outside their routine assignment.
- Student records remain scoped by active status and selected class/section.

## QA
- V40 regression suite: 12/12 passed.
- V37 regression suite: 10/10 passed.
- V41 QA suite: 10/10 passed.
- Backend JavaScript syntax check passed.

## Environment limitation
- This milestone was not certified against a live PostgreSQL server or production deployment environment.
- Frontend production build remains environment-dependent because dependencies are not installed in the current workspace.
