# V43 Release Notes

## Online Exam Engine
- Student online exams now open in an in-portal exam interface instead of an alert-only start action.
- Published exams return their question set with the start response.
- MCQ options use radio selection; non-MCQ questions use free-text answers.
- Client-side countdown timer is shown during an active attempt.
- Submission sends answers to the existing scoped attempt endpoint.
- Backend continues to enforce published status, class scope, attempt ownership, deadline and score cap.
- Responsive exam modal added for mobile use.

## QA
- V43 QA: 12/12 PASS
- V42 regression: PASS
- Backup/restore shell syntax: PASS

Live PostgreSQL integration and production deployment remain pending until the final software/UI review and production infrastructure setup.
