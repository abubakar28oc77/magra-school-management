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
