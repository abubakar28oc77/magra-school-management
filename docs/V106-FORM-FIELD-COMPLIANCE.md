# V106 — Supplied Form Field Compliance

## Scope
The final-candidate data-entry and import workflows must preserve the information categories from the user-supplied teacher/staff and student form screenshots.

## Student form
- Primary school: school name, registration number, completion year
- Identity: Student ID, roll, Bangla/English name, birth registration, DOB, gender, religion, NID
- Academic/admission: class, section, previous school, admission date/class
- Father: Bangla/English name, NID, profession, mobile, abroad country
- Mother: Bangla/English name, NID, profession, mobile, death year
- Guardian: Bangla/English name, NID, relation, mobile, email
- Address: current/permanent village, post office, upazila, district
- Additional: photo, blood group, emergency phone, special needs, notes, extensible custom fields
- Student CSV template now exposes the complete scalar field set used by the form.

## Teacher form
- Identity and family: Employee ID, Bangla/English name, DOB, gender, NID, TIN, birth registration, blood group, religion, marital status, nationality, father/mother names
- Service: designation, English designation, subject, first joining/MPO, current post joining/MPO, previous institution joining/MPO, appointment date/authority, MPO index
- Education: repeatable exam/institution/board/subject/year/result records
- Training: repeatable name/institution/subject/duration/result/date records
- NTRCA: registration, recommendation, year, subject, remarks; registration number/date
- Professional/contact: Teacher Portal ID, mobile, WhatsApp, email, current/permanent address, photo
- Teacher CSV template exposes the scalar field set and supports optional extended_profile_json for repeatable/custom information.

## Staff form
- Identity and family fields matching the supplied staff form categories
- Service/appointment fields
- Education/training repeatable records
- Contact/address/photo
- Staff CSV template exposes the scalar field set and supports optional extended_profile_json.

## Pilot data
Pilot records are synthetic test data only. Before production use, administrators can edit/delete/replace pilot records and import the school's actual records.
