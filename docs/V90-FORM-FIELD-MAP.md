# V90 Form Field Map

V90 expands the Teacher, Staff and Student entry forms from the user-supplied paper forms. No supplied field category is intentionally removed; long/variable groups such as education, training, NTRCA and future custom fields are stored in `extended_profile` JSONB so they can grow without another schema redesign.

## Teacher/Staff
- Identity: Bangla/English name, employee ID, designation, subject, gender, DOB, NID, TIN, birth registration, blood group, religion, marital status, nationality.
- Family: father/mother Bangla and English names.
- Service: first joining, first MPO, current post joining, current MPO, previous institution joining/MPO, appointment date/authority, MPO index, registration number/date, teacher portal ID.
- Education: repeatable education records (exam, institution, board/university, passing year, result, subject).
- Training: repeatable training records (name, institution, subject, duration, result/date).
- NTRCA: registration/recommendation/year/subject/remarks.
- Contact: mobile, WhatsApp, email, current/permanent address, photo.

## Student
- Primary school: school name, registration number, completion year.
- Personal: Student ID, roll, name Bangla/English, birth registration, DOB, gender, religion, class, section, previous school.
- Father: Bangla/English name, NID, profession, mobile, abroad country.
- Mother: Bangla/English name, NID, profession, mobile, death year.
- Guardian: Bangla/English name, NID, relation, mobile, email.
- Address: current and permanent village, post office, upazila and district.
- Additional: admission date/class, photo, special needs, emergency contact and notes.
