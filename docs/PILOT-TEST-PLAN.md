# Pilot Testing Plan — V83

## Purpose
This pilot is deliberately separate from production. The expired BTCL domain `magrapalshs.edu.bd` and any future production hosting/database must remain untouched until the school approves the software after testing.

## Recommended pilot size
- Teachers: 3–5
- Students: 2–4 from each class (6–10)
- At least 1 guardian account linked to a pilot student
- 1 admin account and 1 teacher account for role testing

## What to test
1. Login/logout, password change and password reset.
2. Admin role assignment/revocation and audit logs.
3. Student/teacher/staff records.
4. Class/section and student search/filtering.
5. Daily attendance, absent/late status and guardian visibility.
6. Exams, subject setup, marks entry, grading and result processing.
7. Marksheet, progress report, admit card, tabulation and merit list.
8. Assignment creation, submission and teacher evaluation.
9. Digital learning materials, question bank and online exam.
10. Student, teacher and guardian portals.
11. Notices and notifications.
12. Fees, receipts and finance reports.
13. Library issue/return.
14. Routine, transport and hostel where applicable.
15. Scholarship, events and achievements.
16. Official document issue/register.
17. Public View Page and Login Page on desktop/mobile.
18. Backup/restore before adding larger datasets.

## Important pilot rule
Do not enter sensitive real-world records until the pilot environment is confirmed secure and the school has approved the workflow. Start with non-sensitive or minimal test records where practical.

## Pilot exit criteria
The school should sign off only after each requested workflow has been demonstrated successfully with pilot data. After sign-off, migrate the approved schema/data to a paid production PostgreSQL service and connect the renewed domain/hosting.

## V92 acceptance tests
- Voter list: active Class 6–10 students, voter number editable, deceased-father fallback to mother.
- Village query: current/permanent village search, class-separated 6–10 lists, print/PDF.
- Commendation certificate: preview, print/PDF, issue register.
