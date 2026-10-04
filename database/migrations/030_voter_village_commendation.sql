-- V92: voter list, village-wise student query, and commendation certificate
CREATE TABLE IF NOT EXISTS voter_list_entries (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  voter_no VARCHAR(40),
  voter_name_override VARCHAR(180),
  notes TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voter_list_student ON voter_list_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_students_current_village ON students(current_village);
CREATE INDEX IF NOT EXISTS idx_students_permanent_village ON students(permanent_village);

ALTER TABLE issued_documents DROP CONSTRAINT IF EXISTS issued_documents_document_type_check;
ALTER TABLE issued_documents
  ADD CONSTRAINT issued_documents_document_type_check
  CHECK (document_type IN ('id_card','marksheet','progress_report','certificate','commendation_certificate','admit_card','tabulation','merit_list'));
INSERT INTO document_templates(document_type,name_bn,name_en) VALUES
 ('commendation_certificate','প্রশংসাপত্র','Commendation Certificate')
ON CONFLICT(document_type) DO NOTHING;
