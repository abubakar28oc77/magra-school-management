-- V84 PILOT ONLY — synthetic data for functional testing.
-- DO NOT use this file for production. All names/IDs are fictional.
-- Default pilot passwords: Pilot@12345 (users are flagged to change password).
BEGIN;

-- Pilot accounts. Requires database/schema.sql + all migrations to have been applied first.
INSERT INTO users(login_id,full_name,password_hash,role_id,must_change_password)
SELECT v.login_id,v.full_name,crypt('Pilot@12345',gen_salt('bf')),r.id,TRUE
FROM (VALUES
  ('pilot-admin','Pilot Admin'),
  ('pilot-teacher-01','Pilot Teacher 01'),
  ('pilot-teacher-02','Pilot Teacher 02'),
  ('pilot-teacher-03','Pilot Teacher 03'),
  ('pilot-guardian-01','Pilot Guardian 01'),
  ('pilot-guardian-02','Pilot Guardian 02'),
  ('pilot-student-06-01','Pilot Student 06-01'),
  ('pilot-student-06-02','Pilot Student 06-02'),
  ('pilot-student-07-01','Pilot Student 07-01'),
  ('pilot-student-07-02','Pilot Student 07-02'),
  ('pilot-student-08-01','Pilot Student 08-01'),
  ('pilot-student-08-02','Pilot Student 08-02'),
  ('pilot-student-09-01','Pilot Student 09-01'),
  ('pilot-student-09-02','Pilot Student 09-02'),
  ('pilot-student-10-01','Pilot Student 10-01'),
  ('pilot-student-10-02','Pilot Student 10-02')
) AS v(login_id,full_name)
JOIN roles r ON r.name = CASE
  WHEN v.login_id='pilot-admin' THEN 'admin'
  WHEN v.login_id LIKE 'pilot-teacher-%' THEN 'teacher'
  WHEN v.login_id LIKE 'pilot-guardian-%' THEN 'guardian'
  ELSE 'student' END
ON CONFLICT(login_id) DO UPDATE SET must_change_password=TRUE;

-- Three synthetic teachers.
INSERT INTO teachers(employee_id,name_bn,name_en,designation,designation_en,subject,joining_date,gender,status,user_id)
SELECT v.employee_id,v.name_bn,v.name_en,'সহকারী শিক্ষক','Assistant Teacher',v.subject,'2026-01-01',v.gender,'active',u.id
FROM (VALUES
 ('PILOT-T01','পরীক্ষামূলক শিক্ষক ১','Pilot Teacher 01','বাংলা','পুরুষ','pilot-teacher-01'),
 ('PILOT-T02','পরীক্ষামূলক শিক্ষক ২','Pilot Teacher 02','ইংরেজি','পুরুষ','pilot-teacher-02'),
 ('PILOT-T03','পরীক্ষামূলক শিক্ষক ৩','Pilot Teacher 03','গণিত','নারী',NULL)
) v(employee_id,name_bn,name_en,subject,gender,login_id)
LEFT JOIN users u ON u.login_id=v.login_id
ON CONFLICT(employee_id) DO NOTHING;

-- Two synthetic students per class (6–10).
INSERT INTO students(student_id,roll_no,name_bn,name_en,class_name,section,gender,date_of_birth,guardian_name,guardian_relation,guardian_phone,admission_date,admission_class,status)
SELECT v.student_id,v.roll_no,v.name_bn,v.name_en,v.class_name,'A',v.gender,v.dob,'Pilot Guardian '||v.class_name||'-'||v.roll_no,
       CASE WHEN v.roll_no=1 THEN 'পিতা' ELSE 'মাতা' END,'01700000000','2026-01-01',v.class_name,'active'
FROM (VALUES
 ('PILOT-06-01',1,'পরীক্ষামূলক শিক্ষার্থী ৬-১','Pilot Student 6-1','6','পুরুষ','2014-01-01'),
 ('PILOT-06-02',2,'পরীক্ষামূলক শিক্ষার্থী ৬-২','Pilot Student 6-2','6','নারী','2014-02-01'),
 ('PILOT-07-01',1,'পরীক্ষামূলক শিক্ষার্থী ৭-১','Pilot Student 7-1','7','পুরুষ','2013-01-01'),
 ('PILOT-07-02',2,'পরীক্ষামূলক শিক্ষার্থী ৭-২','Pilot Student 7-2','7','নারী','2013-02-01'),
 ('PILOT-08-01',1,'পরীক্ষামূলক শিক্ষার্থী ৮-১','Pilot Student 8-1','8','পুরুষ','2012-01-01'),
 ('PILOT-08-02',2,'পরীক্ষামূলক শিক্ষার্থী ৮-২','Pilot Student 8-2','8','নারী','2012-02-01'),
 ('PILOT-09-01',1,'পরীক্ষামূলক শিক্ষার্থী ৯-১','Pilot Student 9-1','9','পুরুষ','2011-01-01'),
 ('PILOT-09-02',2,'পরীক্ষামূলক শিক্ষার্থী ৯-২','Pilot Student 9-2','9','নারী','2011-02-01'),
 ('PILOT-10-01',1,'পরীক্ষামূলক শিক্ষার্থী ১০-১','Pilot Student 10-1','10','পুরুষ','2010-01-01'),
 ('PILOT-10-02',2,'পরীক্ষামূলক শিক্ষার্থী ১০-২','Pilot Student 10-2','10','নারী','2010-02-01')
) v(student_id,roll_no,name_bn,name_en,class_name,gender,dob)
ON CONFLICT(student_id) DO NOTHING;

-- Link guardians to pilot students and link every student account to its student record.
INSERT INTO guardian_student_links(guardian_user_id,student_id,relation)
SELECT u.id,s.id,CASE WHEN s.roll_no=1 THEN 'পিতা' ELSE 'মাতা' END
FROM users u JOIN students s ON s.student_id IN ('PILOT-06-01','PILOT-06-02')
WHERE u.login_id='pilot-guardian-01'
ON CONFLICT DO NOTHING;
INSERT INTO guardian_student_links(guardian_user_id,student_id,relation)
SELECT u.id,s.id,CASE WHEN s.roll_no=1 THEN 'পিতা' ELSE 'মাতা' END
FROM users u JOIN students s ON s.student_id IN ('PILOT-07-01','PILOT-07-02')
WHERE u.login_id='pilot-guardian-02'
ON CONFLICT DO NOTHING;
UPDATE students s
SET guardian_email=(SELECT email FROM users WHERE login_id='pilot-guardian-01')
WHERE s.student_id IN ('PILOT-06-01','PILOT-06-02');
UPDATE students s
SET guardian_email=(SELECT email FROM users WHERE login_id='pilot-guardian-02')
WHERE s.student_id IN ('PILOT-07-01','PILOT-07-02');
UPDATE students s
SET user_id=u.id
FROM users u
WHERE u.login_id='pilot-student-' || replace(s.student_id,'PILOT-','')
  AND s.student_id LIKE 'PILOT-%';

-- Minimal academic data for result/attendance workflows.
INSERT INTO academic_years(year,is_current) VALUES (2026,TRUE) ON CONFLICT(year) DO UPDATE SET is_current=TRUE;
INSERT INTO subjects(code,name_bn,name_en,class_name,full_marks,pass_marks) VALUES
 ('PILOT-BAN','বাংলা','Bangla','6',100,33),
 ('PILOT-ENG','ইংরেজি','English','6',100,33),
 ('PILOT-MAT','গণিত','Mathematics','6',100,33)
ON CONFLICT(code) DO NOTHING;

INSERT INTO exams(name_bn,exam_type,academic_year_id,start_date,end_date,status)
SELECT 'Pilot Test Exam','internal',id,'2026-09-20','2026-09-25','published'
FROM academic_years WHERE year=2026
AND NOT EXISTS (SELECT 1 FROM exams WHERE name_bn='Pilot Test Exam');

-- Sample attendance for two students.
INSERT INTO attendance(student_id,attendance_date,status,remarks)
SELECT s.id,d::date,CASE WHEN s.roll_no=1 THEN 'present' ELSE 'absent' END,'Pilot test record'
FROM students s CROSS JOIN generate_series('2026-09-15'::date,'2026-09-16'::date,'1 day') d
WHERE s.student_id IN ('PILOT-06-01','PILOT-06-02')
ON CONFLICT(student_id,attendance_date) DO NOTHING;

-- Sample marks.
INSERT INTO marks(exam_id,student_id,subject_id,written,mcq,practical,total,grade,gpa,remarks)
SELECT e.id,s.id,sub.id,70,20,0,90,'A+',5.00,'Pilot result'
FROM exams e JOIN students s ON s.student_id='PILOT-06-01'
JOIN subjects sub ON sub.code='PILOT-BAN'
WHERE e.name_bn='Pilot Test Exam'
ON CONFLICT(exam_id,student_id,subject_id) DO NOTHING;

-- Assignment + submission.
INSERT INTO assignments(title_bn,subject_id,class_name,description,instructions,due_at,max_marks,status,created_by)
SELECT 'Pilot Assignment',sub.id,'6','Synthetic pilot assignment','Submit a short answer.', '2026-09-30 23:59:00+06',20,'published',u.id
FROM subjects sub CROSS JOIN users u
WHERE sub.code='PILOT-BAN' AND u.login_id='pilot-teacher-01'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE title_bn='Pilot Assignment');
INSERT INTO assignment_submissions(assignment_id,student_id,answer_text,marks,feedback,status)
SELECT a.id,s.id,'Pilot answer',18,'Good pilot submission','graded'
FROM assignments a JOIN students s ON s.student_id='PILOT-06-01'
WHERE a.title_bn='Pilot Assignment'
ON CONFLICT(assignment_id,student_id) DO NOTHING;

-- Finance + library smoke-test records.
INSERT INTO fees(student_id,fee_type,amount,due_date,status)
SELECT id,'Pilot Fee',500,'2026-09-30','due' FROM students WHERE student_id='PILOT-06-01'
AND NOT EXISTS (SELECT 1 FROM fees f WHERE f.student_id=id AND f.fee_type='Pilot Fee');
INSERT INTO books(isbn,title,author,category,quantity,available_quantity)
SELECT 'PILOT-ISBN-001','Pilot Mathematics Book','Pilot Author','Pilot',3,3
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn='PILOT-ISBN-001');
INSERT INTO library_loans(book_id,student_id,issued_at,due_at)
SELECT b.id,s.id,'2026-09-19','2026-09-26'
FROM books b CROSS JOIN students s
WHERE b.isbn='PILOT-ISBN-001' AND s.student_id='PILOT-06-01'
AND NOT EXISTS (SELECT 1 FROM library_loans l WHERE l.book_id=b.id AND l.student_id=s.id AND l.returned_at IS NULL);

-- Pilot notice.
INSERT INTO notices(title_bn,title_en,body,notice_date,published,urgent,created_by)
SELECT 'পাইলট পরীক্ষা সংক্রান্ত নোটিশ','Pilot Test Notice','This is synthetic pilot content.','2026-09-19',TRUE,FALSE,u.id
FROM users u WHERE u.login_id='pilot-admin'
AND NOT EXISTS (SELECT 1 FROM notices WHERE title_bn='পাইলট পরীক্ষা সংক্রান্ত নোটিশ');

COMMIT;
