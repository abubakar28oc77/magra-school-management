# V86 — Feature Control, Expanded Navigation & Modern Forms

- Corrected the release package root from the misleading `magra_work_v81` name to `magra_work_v86`.
- Added migration `026_feature_registry.sql`.
- Added Admin → Feature Control: built-in Admin modules can be enabled/disabled.
- Added View Site menu visibility control.
- Added Custom Feature registry for admin/public shortcuts.
- Expanded the public navigation with the requested institutional, sports/culture, teacher/staff, student, result and student-guide submenu items.
- Modernized the visual treatment of student and teacher/staff data-entry forms while retaining the existing fields and APIs.
- Existing result workflow includes marks entry, exam/subject setup, configurable grading, result processing, analysis and merit list; document workflow includes ID card, marksheet, progress report, certificate, admit card, tabulation and merit list.
- Custom Feature lets the school add a menu/shortcut without code. A genuinely new business-logic module still needs its API/UI implementation; the system is structured so it can be added later.
- Live Supabase migration and production build are not certified in this environment until the pilot database is connected.
