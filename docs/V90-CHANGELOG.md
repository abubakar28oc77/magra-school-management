# V90 — Complete supplied-form field upgrade

## Changed
- Teacher and staff forms expanded to cover the supplied paper-form field categories.
- Student form expanded to cover the supplied paper-form field categories.
- Added multi-step modern UI with section cards, reset/previous/next, image upload preview and repeatable education/training records.
- Added PostgreSQL migration `028_extended_people_forms.sql`.
- Added JSONB `extended_profile` for repeatable education/training/NTRCA and future custom fields.
- API create/update routes persist all V90 named fields.
- Search now includes teacher NID and registration number.

## QA
- Migration numbering checked through 028.
- Backend JavaScript syntax checked with `node --check`.
- JSX build is not claimed here because frontend dependencies are not installed in this environment.
