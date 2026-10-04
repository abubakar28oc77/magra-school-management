-- School leadership/profile seed data
CREATE TABLE IF NOT EXISTS school_profile(
 id SERIAL PRIMARY KEY,
 president_bn VARCHAR(150),
 head_teacher_bn VARCHAR(150),
 assistant_head_teacher_bn VARCHAR(150),
 ict_teacher_bn VARCHAR(150),
 building_image VARCHAR(255),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO school_profile(president_bn,head_teacher_bn,assistant_head_teacher_bn,ict_teacher_bn,building_image)
SELECT 'নেয়ামুল হক খান','মুহাম্মদ শফিকুল ইসলাম','তাপসী সরকার','মুহাম্মদ আবুবকর সিদ্দিক','/school-building.jpg'
WHERE NOT EXISTS (SELECT 1 FROM school_profile);
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS roles(id SERIAL PRIMARY KEY,name VARCHAR(60) UNIQUE NOT NULL,label_bn VARCHAR(100) NOT NULL);
INSERT INTO roles(name,label_bn) VALUES
('super_admin','সুপার অ্যাডমিন'),('admin','অ্যাডমিন'),('head_teacher','প্রধান শিক্ষক'),('assistant_head_teacher','সহকারী প্রধান শিক্ষক'),('teacher','শিক্ষক'),('accountant','হিসাবরক্ষক'),('librarian','গ্রন্থাগারিক'),('student','শিক্ষার্থী'),('guardian','অভিভাবক'),('staff','কর্মচারী') ON CONFLICT(name) DO NOTHING;
CREATE TABLE IF NOT EXISTS permissions(id SERIAL PRIMARY KEY,code VARCHAR(100) UNIQUE NOT NULL,label_bn VARCHAR(150) NOT NULL);
CREATE TABLE IF NOT EXISTS role_permissions(role_id INT REFERENCES roles(id) ON DELETE CASCADE,permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,PRIMARY KEY(role_id,permission_id));
CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),login_id VARCHAR(100) UNIQUE NOT NULL,full_name VARCHAR(180) NOT NULL,email VARCHAR(180),phone VARCHAR(40),password_hash TEXT NOT NULL,role_id INT NOT NULL REFERENCES roles(id),is_active BOOLEAN NOT NULL DEFAULT TRUE,must_change_password BOOLEAN NOT NULL DEFAULT FALSE,last_login_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS students(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),student_id VARCHAR(60) UNIQUE NOT NULL,roll_no INT,name_bn VARCHAR(180) NOT NULL,name_en VARCHAR(180),class_name VARCHAR(30) NOT NULL,section VARCHAR(30),gender VARCHAR(30),date_of_birth DATE,blood_group VARCHAR(10),religion VARCHAR(50),father_name VARCHAR(180),mother_name VARCHAR(180),guardian_name VARCHAR(180),guardian_relation VARCHAR(80),guardian_phone VARCHAR(40),guardian_email VARCHAR(180),address TEXT,admission_date DATE,admission_class VARCHAR(30),previous_school VARCHAR(250),birth_registration_no VARCHAR(80),emergency_phone VARCHAR(40),photo_url TEXT,status VARCHAR(30) NOT NULL DEFAULT 'active',created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS teachers(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),employee_id VARCHAR(60) UNIQUE NOT NULL,name_bn VARCHAR(180) NOT NULL,name_en VARCHAR(180),designation VARCHAR(120),designation_en VARCHAR(120),subject VARCHAR(120),phone VARCHAR(40),email VARCHAR(180),joining_date DATE,gender VARCHAR(30),address TEXT,user_id UUID REFERENCES users(id) ON DELETE SET NULL,photo_url TEXT,status VARCHAR(30) DEFAULT 'active');
CREATE TABLE IF NOT EXISTS staff(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),employee_id VARCHAR(60) UNIQUE NOT NULL,name_bn VARCHAR(180) NOT NULL,name_en VARCHAR(180),designation VARCHAR(120) NOT NULL,phone VARCHAR(40),email VARCHAR(180),joining_date DATE,gender VARCHAR(30),address TEXT,status VARCHAR(30) NOT NULL DEFAULT 'active',user_id UUID REFERENCES users(id) ON DELETE SET NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS academic_years(id SERIAL PRIMARY KEY,year INT UNIQUE NOT NULL,is_current BOOLEAN DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS subjects(id SERIAL PRIMARY KEY,code VARCHAR(30) UNIQUE NOT NULL,name_bn VARCHAR(120) NOT NULL,name_en VARCHAR(120),class_name VARCHAR(30),full_marks NUMERIC(8,2) DEFAULT 100,pass_marks NUMERIC(8,2) DEFAULT 33,active BOOLEAN DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS exams(id SERIAL PRIMARY KEY,name_bn VARCHAR(150) NOT NULL,exam_type VARCHAR(60),academic_year_id INT REFERENCES academic_years(id),start_date DATE,end_date DATE,status VARCHAR(30) DEFAULT 'draft');
CREATE TABLE IF NOT EXISTS marks(id BIGSERIAL PRIMARY KEY,exam_id INT REFERENCES exams(id) ON DELETE CASCADE,student_id UUID REFERENCES students(id) ON DELETE CASCADE,subject_id INT REFERENCES subjects(id),written NUMERIC(8,2),mcq NUMERIC(8,2),practical NUMERIC(8,2),total NUMERIC(8,2),grade VARCHAR(10),gpa NUMERIC(4,2),remarks TEXT,UNIQUE(exam_id,student_id,subject_id));
CREATE TABLE IF NOT EXISTS attendance(id BIGSERIAL PRIMARY KEY,student_id UUID REFERENCES students(id) ON DELETE CASCADE,attendance_date DATE NOT NULL,status VARCHAR(20) NOT NULL,remarks TEXT,UNIQUE(student_id,attendance_date));
CREATE TABLE IF NOT EXISTS notices(id SERIAL PRIMARY KEY,title_bn VARCHAR(250) NOT NULL,title_en VARCHAR(250),body TEXT,notice_date DATE DEFAULT CURRENT_DATE,published BOOLEAN DEFAULT FALSE,urgent BOOLEAN DEFAULT FALSE,attachment_url TEXT,created_by UUID REFERENCES users(id));
CREATE TABLE IF NOT EXISTS fees(id BIGSERIAL PRIMARY KEY,student_id UUID REFERENCES students(id),fee_type VARCHAR(80) NOT NULL,amount NUMERIC(12,2) NOT NULL,due_date DATE,status VARCHAR(30) DEFAULT 'due',paid_at TIMESTAMPTZ,receipt_no VARCHAR(80) UNIQUE);
CREATE TABLE IF NOT EXISTS books(id SERIAL PRIMARY KEY,isbn VARCHAR(60),title VARCHAR(250) NOT NULL,author VARCHAR(180),category VARCHAR(100),quantity INT DEFAULT 1,available_quantity INT DEFAULT 1);
CREATE TABLE IF NOT EXISTS library_loans(id BIGSERIAL PRIMARY KEY,book_id INT REFERENCES books(id),student_id UUID REFERENCES students(id),issued_at DATE DEFAULT CURRENT_DATE,due_at DATE,returned_at DATE,fine NUMERIC(10,2) DEFAULT 0);
CREATE TABLE IF NOT EXISTS routines(id SERIAL PRIMARY KEY,class_name VARCHAR(30),section VARCHAR(30),day_of_week INT,start_time TIME,end_time TIME,subject_id INT REFERENCES subjects(id),teacher_id UUID REFERENCES teachers(id),room VARCHAR(60));
CREATE TABLE IF NOT EXISTS audit_logs(id BIGSERIAL PRIMARY KEY,user_id UUID REFERENCES users(id),action VARCHAR(100) NOT NULL,entity VARCHAR(100),entity_id VARCHAR(100),details JSONB,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name,section,roll_no);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_marks_exam_student ON marks(exam_id,student_id);
CREATE INDEX IF NOT EXISTS idx_notices_published_date ON notices(published,notice_date DESC);
-- Development-only account. Change password immediately in a real deployment.
-- Password: ChangeMe123!
INSERT INTO users(login_id,full_name,password_hash,role_id,must_change_password)
SELECT '114290','System Administrator',crypt('ChangeMe123!',gen_salt('bf')),r.id,TRUE FROM roles r WHERE r.name='super_admin'
ON CONFLICT(login_id) DO NOTHING;

-- V5 security/RBAC permission seed
INSERT INTO permissions(code,label_bn) VALUES
('user.view','ব্যবহারকারী দেখা'),('user.create','ব্যবহারকারী তৈরি'),('user.update','ব্যবহারকারী সম্পাদনা'),('user.role','Role পরিবর্তন'),('user.password_reset','Password reset'),('student.view','শিক্ষার্থী দেখা'),('student.manage','শিক্ষার্থী ব্যবস্থাপনা'),('attendance.manage','উপস্থিতি ব্যবস্থাপনা'),('result.manage','ফলাফল ব্যবস্থাপনা'),('notice.manage','নোটিশ ব্যবস্থাপনা')
ON CONFLICT(code) DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name IN ('super_admin','admin') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('student.view','attendance.manage','result.manage','notice.manage')
WHERE r.name='head_teacher' ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('student.view','attendance.manage','result.manage')
WHERE r.name IN ('assistant_head_teacher','teacher') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS admission_applications(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 application_no VARCHAR(50) UNIQUE NOT NULL,
 academic_year INT NOT NULL,
 applied_class VARCHAR(30) NOT NULL,
 applicant_name_bn VARCHAR(180) NOT NULL,
 applicant_name_en VARCHAR(180),
 date_of_birth DATE,
 gender VARCHAR(30),
 birth_registration_no VARCHAR(80),
 father_name VARCHAR(180),
 mother_name VARCHAR(180),
 guardian_name VARCHAR(180),
 guardian_phone VARCHAR(40) NOT NULL,
 guardian_email VARCHAR(180),
 address TEXT,
 previous_school VARCHAR(250),
 quota VARCHAR(80),
 application_date DATE NOT NULL DEFAULT CURRENT_DATE,
 status VARCHAR(30) NOT NULL DEFAULT 'submitted',
 admission_test_mark NUMERIC(8,2),
 payment_amount NUMERIC(12,2) DEFAULT 0,
 payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
 notes TEXT,
 converted_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admission_year_class ON admission_applications(academic_year, applied_class);
CREATE INDEX IF NOT EXISTS idx_admission_status ON admission_applications(status);
CREATE INDEX IF NOT EXISTS idx_admission_phone ON admission_applications(guardian_phone);

-- V9 Examination & Result Engine
CREATE TABLE IF NOT EXISTS grading_schemes(id SERIAL PRIMARY KEY,name_bn VARCHAR(150) NOT NULL,name_en VARCHAR(150),board VARCHAR(120),academic_year INT,pass_percent NUMERIC(5,2) DEFAULT 33,active BOOLEAN DEFAULT TRUE,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS grade_rules(id SERIAL PRIMARY KEY,scheme_id INT NOT NULL REFERENCES grading_schemes(id) ON DELETE CASCADE,min_percent NUMERIC(5,2) NOT NULL,max_percent NUMERIC(5,2) NOT NULL,letter_grade VARCHAR(10) NOT NULL,gpa NUMERIC(4,2) NOT NULL,UNIQUE(scheme_id,min_percent,max_percent));
CREATE TABLE IF NOT EXISTS exam_subjects(id SERIAL PRIMARY KEY,exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,subject_id INT NOT NULL REFERENCES subjects(id),full_marks NUMERIC(8,2) DEFAULT 100,pass_marks NUMERIC(8,2) DEFAULT 33,written_max NUMERIC(8,2) DEFAULT 100,mcq_max NUMERIC(8,2) DEFAULT 0,practical_max NUMERIC(8,2) DEFAULT 0,UNIQUE(exam_id,subject_id));
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam ON exam_subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_grade_rules_scheme ON grade_rules(scheme_id,min_percent DESC);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS grading_scheme_id INT REFERENCES grading_schemes(id);
ALTER TABLE marks ADD COLUMN IF NOT EXISTS absent BOOLEAN DEFAULT FALSE;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- V10 Finance & Library enhancements
CREATE TABLE IF NOT EXISTS fee_payments(id BIGSERIAL PRIMARY KEY,fee_id BIGINT NOT NULL REFERENCES fees(id) ON DELETE CASCADE,amount NUMERIC(12,2) NOT NULL CHECK(amount>0),payment_method VARCHAR(30) DEFAULT 'cash',reference VARCHAR(120),paid_at TIMESTAMPTZ DEFAULT NOW(),received_by UUID REFERENCES users(id));
CREATE TABLE IF NOT EXISTS expenses(id BIGSERIAL PRIMARY KEY,title VARCHAR(200) NOT NULL,category VARCHAR(100),amount NUMERIC(12,2) NOT NULL CHECK(amount>0),expense_date DATE DEFAULT CURRENT_DATE,notes TEXT,created_by UUID REFERENCES users(id),created_at TIMESTAMPTZ DEFAULT NOW());

-- V11 portal/learning additions
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE TABLE IF NOT EXISTS guardian_student_links(id BIGSERIAL PRIMARY KEY,guardian_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,relation VARCHAR(50),UNIQUE(guardian_user_id,student_id));
CREATE TABLE IF NOT EXISTS learning_contents(id BIGSERIAL PRIMARY KEY,class_name VARCHAR(30) NOT NULL,subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,title_bn VARCHAR(250) NOT NULL,title_en VARCHAR(250),content_type VARCHAR(30) NOT NULL DEFAULT 'note',content_url TEXT,body TEXT,published BOOLEAN NOT NULL DEFAULT FALSE,created_by UUID REFERENCES users(id) ON DELETE SET NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- V13 assessment/learning tables (see migration 012_assessment_learning.sql)

-- V14 migration
-- V14: AI Education, study plans and learning analytics foundation
CREATE TABLE IF NOT EXISTS ai_conversations(
 id BIGSERIAL PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title VARCHAR(200),
 language VARCHAR(10) NOT NULL DEFAULT 'bn',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ai_messages(
 id BIGSERIAL PRIMARY KEY,
 conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
 role VARCHAR(20) NOT NULL CHECK(role IN ('user','assistant','system')),
 message TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id,created_at);
CREATE TABLE IF NOT EXISTS study_plans(
 id BIGSERIAL PRIMARY KEY,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 title_bn VARCHAR(250) NOT NULL,
 goal TEXT,
 start_date DATE NOT NULL,
 end_date DATE NOT NULL,
 plan_json JSONB NOT NULL DEFAULT '[]'::jsonb,
 status VARCHAR(20) NOT NULL DEFAULT 'active',
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_plans_student ON study_plans(student_id,status);
CREATE TABLE IF NOT EXISTS ai_feedback(
 id BIGSERIAL PRIMARY KEY,
 student_id UUID REFERENCES students(id) ON DELETE CASCADE,
 topic VARCHAR(200),
 feedback_type VARCHAR(50),
 feedback TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_student ON ai_feedback(student_id,created_at DESC);

-- V15 Advanced Reports & Analytics indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_marks_student_exam ON marks(student_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_paid_at ON fee_payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_loans_student_returned ON library_loans(student_id, returned_at);
CREATE INDEX IF NOT EXISTS idx_admission_application_date ON admission_applications(application_date DESC);
-- V16 Official Documents & Print System
CREATE TABLE IF NOT EXISTS document_templates(
 id BIGSERIAL PRIMARY KEY,
 document_type VARCHAR(40) NOT NULL UNIQUE,
 name_bn VARCHAR(150) NOT NULL,
 name_en VARCHAR(150),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 settings JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS issued_documents(
 id BIGSERIAL PRIMARY KEY,
 document_type VARCHAR(40) NOT NULL,
 student_id UUID REFERENCES students(id) ON DELETE SET NULL,
 exam_id INT REFERENCES exams(id) ON DELETE SET NULL,
 document_no VARCHAR(80) NOT NULL UNIQUE,
 issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
 data_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
 issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_issued_documents_student ON issued_documents(student_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issued_documents_type ON issued_documents(document_type,issue_date DESC);
INSERT INTO document_templates(document_type,name_bn,name_en) VALUES
 ('id_card','শিক্ষার্থী পরিচয়পত্র','Student ID Card'),
 ('marksheet','মার্কশিট','Marksheet'),
 ('progress_report','প্রগ্রেস রিপোর্ট','Progress Report'),
 ('certificate','সনদপত্র','Certificate'),
 ('admit_card','প্রবেশপত্র','Admit Card'),
 ('tabulation','ট্যাবুলেশন শিট','Tabulation Sheet'),
 ('merit_list','মেধা তালিকা','Merit List')
ON CONFLICT(document_type) DO NOTHING;

-- V17 Notifications & Communication
CREATE TABLE IF NOT EXISTS notifications(
 id BIGSERIAL PRIMARY KEY,
 recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title_bn VARCHAR(250) NOT NULL,
 title_en VARCHAR(250),
 body TEXT,
 type VARCHAR(40) NOT NULL DEFAULT 'general',
 priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
 entity_type VARCHAR(60),
 entity_id VARCHAR(100),
 action_url TEXT,
 is_read BOOLEAN NOT NULL DEFAULT FALSE,
 read_at TIMESTAMPTZ,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id,is_read,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type,created_at DESC);
CREATE TABLE IF NOT EXISTS notification_preferences(
 id BIGSERIAL PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 channel VARCHAR(20) NOT NULL DEFAULT 'in_app' CHECK(channel IN ('in_app','email','sms','push')),
 notification_type VARCHAR(40) NOT NULL DEFAULT 'general',
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(user_id,channel,notification_type)
);
CREATE TABLE IF NOT EXISTS communication_messages(
 id BIGSERIAL PRIMARY KEY,
 sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
 recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 recipient_group VARCHAR(30),
 subject_bn VARCHAR(250),
 body TEXT NOT NULL,
 channel VARCHAR(20) NOT NULL DEFAULT 'in_app',
 status VARCHAR(20) NOT NULL DEFAULT 'queued',
 sent_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(recipient_user_id IS NOT NULL OR recipient_group IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_communication_messages_recipient ON communication_messages(recipient_user_id,created_at DESC);

-- V22 session invalidation: increment when password/role/status changes to invalidate old JWTs
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_token_version INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_auth_token_version ON users(id, auth_token_version);

-- V114 teacher directory timestamps: required by dynamic public contact ordering and audit-friendly updates.
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_teachers_updated_at ON teachers(updated_at DESC);

-- V111 public contact directory fields (also applied by migration 035)
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS public_contact_role VARCHAR(40);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS public_contact_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS public_contact_role VARCHAR(40);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS public_contact_enabled BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_teachers_public_contact ON teachers(status, public_contact_role, public_contact_enabled);
CREATE INDEX IF NOT EXISTS idx_staff_public_contact ON staff(status, public_contact_role, public_contact_enabled);

-- V117 performance hardening
-- V117 performance hardening for 600+ student scale and growing school data.
CREATE INDEX IF NOT EXISTS idx_students_public_stats ON students(status, gender, religion, class_name);
CREATE INDEX IF NOT EXISTS idx_students_attendance_roster ON students(status, class_name, section, roll_no, name_bn);
CREATE INDEX IF NOT EXISTS idx_attendance_date_student_status ON attendance(attendance_date, student_id, status);
CREATE INDEX IF NOT EXISTS idx_marks_student_subject ON marks(student_id, subject_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_paid_at ON fee_payments(fee_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_fees_student_due_status ON fees(student_id, due_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
