# V6 Release Notes — Student & Staff Management

This milestone turns the Student and Teacher/Staff areas from placeholders into working CRUD foundations.

## Student
- Full profile data model for academic, guardian and emergency information
- Search by student ID/name/guardian
- Filter by class, section and status
- Create and edit student profiles
- Lifecycle status: active, inactive, graduated, transferred, dropped_out
- Audit logging for create/update/status changes

## Teacher
- Employee ID and professional profile
- Subject/designation/contact information
- Optional linkage to a user account
- Search and status filtering
- Create/edit/status management

## Staff
- Separate staff entity from teachers
- Employee ID, designation, contact and status
- Optional user account linkage

## Migration
Run `database/migrations/006_student_staff_management.sql` after the existing schema on an already deployed database.
For a fresh database, the updated `database/schema.sql` includes the V6 structure.
