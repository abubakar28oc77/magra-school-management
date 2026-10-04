-- V11: portal identity links and digital learning foundation
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE TABLE IF NOT EXISTS guardian_student_links(
 id BIGSERIAL PRIMARY KEY,
 guardian_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 relation VARCHAR(50),
 UNIQUE(guardian_user_id,student_id)
);
CREATE INDEX IF NOT EXISTS idx_guardian_links_user ON guardian_student_links(guardian_user_id);
CREATE TABLE IF NOT EXISTS learning_contents(
 id BIGSERIAL PRIMARY KEY,
 class_name VARCHAR(30) NOT NULL,
 subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
 title_bn VARCHAR(250) NOT NULL,
 title_en VARCHAR(250),
 content_type VARCHAR(30) NOT NULL DEFAULT 'note',
 content_url TEXT,
 body TEXT,
 published BOOLEAN NOT NULL DEFAULT FALSE,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_class_subject ON learning_contents(class_name,subject_id,published);
