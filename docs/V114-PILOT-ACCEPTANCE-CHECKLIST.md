# Magra School Management V114 — Pilot Acceptance Checklist

## Before connecting the pilot database
- [ ] Copy `backend/.env.pilot.example` to `.env` and supply the real pilot PostgreSQL connection string.
- [ ] Run the migration runner through migration 036.
- [ ] Confirm `/health` and `/ready` report V114.

## Core data acceptance
- [ ] Add a student manually.
- [ ] Edit the student and verify all supplied school-form fields persist.
- [ ] Import students from the generated CSV template.
- [ ] Re-import an existing `student_id` and confirm it updates rather than duplicates.
- [ ] Add/edit/import teachers using the supplied teacher field set.
- [ ] Add/edit/import staff using the supplied staff field set.

## Dynamic public website
- [ ] Verify active student count is read from the database.
- [ ] Verify active teacher count is read from the database.
- [ ] Verify religion/gender/class statistics are read from active students.
- [ ] Assign Head Teacher, Assistant Head Teacher, ICT Teacher and Office Assistant contact roles.
- [ ] Change a contact's phone/email and verify the public Contact section updates automatically.
- [ ] Set a staff/teacher profile to retired/former/inactive and verify it disappears from public Contact.
- [ ] Assign a replacement contact and verify the public site shows the replacement.

## Scale acceptance
- [ ] Import a representative 600+ student dataset.
- [ ] Test search and server-side pagination.
- [ ] Test attendance and result queries on the larger dataset.
- [ ] Confirm no public page uses hard-coded student/teacher totals.

## Pilot cleanup
- [ ] Backup pilot data.
- [ ] Remove only synthetic pilot records.
- [ ] Verify no real school records are deleted.

## Production handoff
- [ ] Review security settings and change all development credentials.
- [ ] Configure production database backups.
- [ ] Configure production hosting and SSL.
- [ ] Connect `magrapalshs.edu.bd` only after pilot acceptance is complete.
