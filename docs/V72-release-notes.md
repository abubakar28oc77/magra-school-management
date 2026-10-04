# Magra School Management — V72 Release Notes

## Focus
Official document workflow hardening and issue-register integration, while preserving the locked public View Page reference sequence 1 → 2 → 3 → 4.

## Changes
- Added migration `025_document_integrity.sql` with a database CHECK constraint limiting issued document types to the seven supported document types.
- Added an index for issued documents by exam/date.
- Added server-side document type allowlisting for document preview generation.
- Added server-side validation for required student/exam context when issuing documents.
- Added `Officially Issue` action to the Admin document generator.
- Added issued-document registry view/filter in the Admin document module.
- Added HTML escaping for values inserted into the print window, reducing injection risk from stored student/school data.
- Added UTF-8 metadata to generated print documents.
- Retained EIIN 114290, school identity, leadership data, portals, and the final four-section public View Page.

## QA
- V72 Document & Integrity Audit: 15/15 PASS.
- Backend syntax check: PASS.
- QA script syntax check: PASS.
- Full Vite production build: NOT CERTIFIED in this environment because frontend dependencies are not installed.
- Live PostgreSQL integration: NOT CERTIFIED; production database has not been connected by design.
- Production deployment/domain: NOT DONE by design; reserved for final UI/software review and deployment phase.
