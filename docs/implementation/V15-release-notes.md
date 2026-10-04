# V15 Release Notes — Advanced Reports & Analytics

## Added
- Executive overview API combining students, teachers, attendance, finance, admissions, library and marks.
- Attendance trend and class-wise attendance analysis.
- Result summary by class and subject with average/below-pass counts.
- Monthly collection vs expense report for the last 12 months.
- Admission summary by academic year and class.
- Student risk report using attendance and marks indicators.
- Supporting database indexes for report-heavy queries.

## Verification
- Backend syntax check completed.
- SQL migration syntax reviewed.
- Report queries use parameterized inputs where user-controlled values exist.
- Production PostgreSQL end-to-end execution still requires the real deployment database.
