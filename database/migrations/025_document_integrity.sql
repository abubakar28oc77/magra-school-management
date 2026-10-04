-- V72 — official document integrity
-- Keep the issued-document registry aligned with the supported generator types.
ALTER TABLE issued_documents DROP CONSTRAINT IF EXISTS issued_documents_document_type_check;
ALTER TABLE issued_documents
  ADD CONSTRAINT issued_documents_document_type_check
  CHECK (document_type IN ('id_card','marksheet','progress_report','certificate','admit_card','tabulation','merit_list'));

CREATE INDEX IF NOT EXISTS idx_issued_documents_exam
  ON issued_documents(exam_id,issue_date DESC);
