-- V9 Examination & Result Engine
CREATE TABLE IF NOT EXISTS grading_schemes(
 id SERIAL PRIMARY KEY, name_bn VARCHAR(150) NOT NULL, name_en VARCHAR(150), board VARCHAR(120), academic_year INT,
 pass_percent NUMERIC(5,2) DEFAULT 33, active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS grade_rules(
 id SERIAL PRIMARY KEY, scheme_id INT NOT NULL REFERENCES grading_schemes(id) ON DELETE CASCADE,
 min_percent NUMERIC(5,2) NOT NULL, max_percent NUMERIC(5,2) NOT NULL, letter_grade VARCHAR(10) NOT NULL, gpa NUMERIC(4,2) NOT NULL,
 UNIQUE(scheme_id,min_percent,max_percent)
);
CREATE TABLE IF NOT EXISTS exam_subjects(
 id SERIAL PRIMARY KEY, exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE, subject_id INT NOT NULL REFERENCES subjects(id),
 full_marks NUMERIC(8,2) DEFAULT 100, pass_marks NUMERIC(8,2) DEFAULT 33,
 written_max NUMERIC(8,2) DEFAULT 100, mcq_max NUMERIC(8,2) DEFAULT 0, practical_max NUMERIC(8,2) DEFAULT 0,
 UNIQUE(exam_id,subject_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam ON exam_subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_grade_rules_scheme ON grade_rules(scheme_id,min_percent DESC);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS grading_scheme_id INT REFERENCES grading_schemes(id);
ALTER TABLE marks ADD COLUMN IF NOT EXISTS absent BOOLEAN DEFAULT FALSE;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

INSERT INTO grading_schemes(name_bn,name_en,board,academic_year,pass_percent,active)
SELECT 'বাংলাদেশ মাধ্যমিক সাধারণ গ্রেডিং','Bangladesh Secondary General Grading','মাধ্যমিক শিক্ষা',EXTRACT(YEAR FROM CURRENT_DATE)::int,33,true
WHERE NOT EXISTS (SELECT 1 FROM grading_schemes);
INSERT INTO grade_rules(scheme_id,min_percent,max_percent,letter_grade,gpa)
SELECT g.id,v.min_percent,v.max_percent,v.letter_grade,v.gpa FROM grading_schemes g CROSS JOIN (VALUES
(80::numeric,100::numeric,'A+',5::numeric),(70,79.99,'A',4),(60,69.99,'A-',3.5),(50,59.99,'B',3),(40,49.99,'C',2),(33,39.99,'D',1),(0,32.99,'F',0)
) v(min_percent,max_percent,letter_grade,gpa)
WHERE NOT EXISTS (SELECT 1 FROM grade_rules r WHERE r.scheme_id=g.id);
