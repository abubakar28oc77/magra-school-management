# V99 — Custom Field Search & Reporting

## Added
- Student directory can filter by enabled custom fields and custom values.
- Teacher directory can filter by enabled custom fields and custom values.
- Staff directory can filter by enabled custom fields and custom values.
- Student/Teacher/Staff directory CSV reports include enabled custom fields.
- Custom field values are read from `extended_profile.custom_fields` and remain compatible with the existing Form Builder.

## Backend
- Added `custom_field_key` and `custom_field_value` query parameters to student, teacher and staff list APIs.
- JSONB custom field filtering is parameterized.

## Retained
- Feature Control
- Form Builder
- Voter List
- Village-wise Student List
- Bilingual Document Generator / Print Output

## QA
- V98 regression: 10/10 PASS
- V99 QA: 10/10 PASS
- Backend `node --check`: PASS

## Not certified in this environment
- Full Vite production build
- Live Supabase/PostgreSQL connection
- Production deployment/browser acceptance
