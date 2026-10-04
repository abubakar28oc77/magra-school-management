-- V34: Operational-scale indexes for growing student population
-- Safe/idempotent: can be applied repeatedly.
CREATE INDEX IF NOT EXISTS idx_attendance_student_date_status ON attendance(student_id, attendance_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_attendance_date_status_student ON attendance(attendance_date DESC, status, student_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_exam_subject ON marks(student_id, exam_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam_student ON marks(exam_id, student_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_due ON fees(student_id, due_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_paid_at ON fee_payments(fee_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_loans_student_returned ON library_loans(student_id, returned_at, issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_user ON audit_logs(created_at DESC, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guardian_links_student ON guardian_student_links(student_id, guardian_user_id);
