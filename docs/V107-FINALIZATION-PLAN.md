# Magra School Management — V107 Finalization Plan

## Data-entry fidelity
Student, teacher, and staff entry/import fields follow the previously supplied reference-form field structure. The UI supports multi-step entry, edit/update, CSV template download, and CSV bulk import.

## Pilot data policy
Pilot records are synthetic and must not be treated as production records. Before production launch, pilot cleanup may remove only records marked by the pilot cleanup safeguards. Production cleanup is refused.

## Real-data onboarding
- Students: individual entry/edit or CSV import (up to 500 rows per request)
- Teachers: individual entry/edit or CSV import (up to 500 rows per request)
- Staff: individual entry/edit or CSV import (up to 500 rows per request)
- Existing records are updated by stable Student ID / Employee ID rather than duplicated.

## Acceptance sequence
1. Configure the free pilot database.
2. Run migrations 006–032.
3. Seed synthetic pilot data.
4. Verify login, roles, CRUD, attendance, results, documents, reports, imports and edits.
5. Remove pilot data using the guarded cleanup process.
6. Create/restore production database and deploy.
7. Point `magrapalshs.edu.bd` to the production deployment only after acceptance.

## Current verification
- V106 form-field QA: 8/8 PASS
- V105 regression QA: 10/10 PASS
- Node syntax checks: PASS

## Production caution
Do not place real school data in the pilot database unless a backup/export and migration plan has first been confirmed.
