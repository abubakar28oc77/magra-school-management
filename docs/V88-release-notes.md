# V88 — Feature Architecture & Modern Admin UX

V88 consolidates the working V81 application panels with the V86/V87 feature-control architecture after a release-package audit found that the previous V87 frontend entry file had lost several existing panel definitions.

## Included

- Hierarchical Admin navigation with expandable main menu → submenu structure.
- Admin feature registry with module and submenu ON/OFF controls.
- Public View Site menu/submenu ON/OFF controls.
- Custom Feature registry for adding menu/shortcut entries without editing source code.
- Modern step-based Student form: personal, academic, guardian and additional information.
- Modern step-based Teacher/Staff form: identity, professional and contact information.
- Existing Student, Teacher/Staff, Admission, Attendance, Result, Mark Entry, Marksheet, Tabulation, Merit, Document, Learning, AI, Finance, Library and Portal panels retained from the stable V81 application base.
- Migration `026_feature_registry.sql` and `027_navigation_hierarchy.sql`.
- Pilot setup script continues to apply all numbered migrations in order.
- Login role routing corrected to use the backend's `role` field.

## QA status

- Backend syntax check: PASS.
- V88 static QA: PASS.
- Full frontend Vite production build: not yet certified because dependencies are not installed in this environment.
- Live Supabase migration/API test: not yet run.

## Pilot safety

Do not enter real school data yet. Use the dedicated Supabase pilot project first; production domain/hosting remains untouched.
