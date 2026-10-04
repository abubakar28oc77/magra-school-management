# V87 — Navigation & Feature Control Upgrade

- Added hierarchical feature registry with `parent_key`.
- Added admin submenu controls for students, staff, admission, attendance, exams/results, learning, documents, users, school-life CMS and feature control.
- Added public submenu registry so each public submenu can be independently enabled/disabled.
- Public feature API now returns `parent_key` for dynamic navigation.
- Added a V87 static QA script.
- Live database migration and full production build remain to be executed against the user's pilot Supabase project.
