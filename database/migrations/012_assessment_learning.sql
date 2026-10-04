-- V13: Question Bank, Assignments and Online Exam foundation
CREATE TABLE IF NOT EXISTS question_bank(
 id BIGSERIAL PRIMARY KEY,
 class_name VARCHAR(30) NOT NULL,
 subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
 chapter VARCHAR(180),
 question_type VARCHAR(30) NOT NULL DEFAULT 'mcq',
 question_bn TEXT NOT NULL,
 question_en TEXT,
 options JSONB,
 correct_answer TEXT,
 marks NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK(marks>0),
 difficulty VARCHAR(20) DEFAULT 'medium',
 explanation TEXT,
 published BOOLEAN NOT NULL DEFAULT FALSE,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_question_bank_filter ON question_bank(class_name,subject_id,question_type,published);

CREATE TABLE IF NOT EXISTS assignments(
 id BIGSERIAL PRIMARY KEY,
 title_bn VARCHAR(250) NOT NULL,
 subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
 class_name VARCHAR(30) NOT NULL,
 description TEXT,
 instructions TEXT,
 due_at TIMESTAMPTZ,
 max_marks NUMERIC(8,2) DEFAULT 100,
 status VARCHAR(30) NOT NULL DEFAULT 'draft',
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS assignment_submissions(
 id BIGSERIAL PRIMARY KEY,
 assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 answer_text TEXT,
 attachment_url TEXT,
 submitted_at TIMESTAMPTZ DEFAULT NOW(),
 marks NUMERIC(8,2),
 feedback TEXT,
 status VARCHAR(30) DEFAULT 'submitted',
 UNIQUE(assignment_id,student_id)
);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id,assignment_id);

CREATE TABLE IF NOT EXISTS online_exams(
 id BIGSERIAL PRIMARY KEY,
 title_bn VARCHAR(250) NOT NULL,
 subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
 class_name VARCHAR(30) NOT NULL,
 duration_minutes INT NOT NULL DEFAULT 30 CHECK(duration_minutes>0),
 total_marks NUMERIC(8,2) DEFAULT 0,
 pass_marks NUMERIC(8,2) DEFAULT 0,
 starts_at TIMESTAMPTZ,
 ends_at TIMESTAMPTZ,
 status VARCHAR(30) NOT NULL DEFAULT 'draft',
 shuffle_questions BOOLEAN DEFAULT TRUE,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS online_exam_questions(
 id BIGSERIAL PRIMARY KEY,
 online_exam_id BIGINT NOT NULL REFERENCES online_exams(id) ON DELETE CASCADE,
 question_id BIGINT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
 display_order INT NOT NULL DEFAULT 1,
 UNIQUE(online_exam_id,question_id)
);
CREATE TABLE IF NOT EXISTS online_exam_attempts(
 id BIGSERIAL PRIMARY KEY,
 online_exam_id BIGINT NOT NULL REFERENCES online_exams(id) ON DELETE CASCADE,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 started_at TIMESTAMPTZ DEFAULT NOW(),
 submitted_at TIMESTAMPTZ,
 score NUMERIC(8,2) DEFAULT 0,
 status VARCHAR(30) DEFAULT 'in_progress',
 UNIQUE(online_exam_id,student_id)
);
CREATE TABLE IF NOT EXISTS online_exam_answers(
 id BIGSERIAL PRIMARY KEY,
 attempt_id BIGINT NOT NULL REFERENCES online_exam_attempts(id) ON DELETE CASCADE,
 question_id BIGINT NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
 answer TEXT,
 is_correct BOOLEAN,
 marks_awarded NUMERIC(8,2) DEFAULT 0,
 UNIQUE(attempt_id,question_id)
);
CREATE INDEX IF NOT EXISTS idx_online_exam_class_status ON online_exams(class_name,status);
CREATE INDEX IF NOT EXISTS idx_online_attempt_student ON online_exam_attempts(student_id,online_exam_id);
