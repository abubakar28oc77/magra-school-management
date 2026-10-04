-- V115 performance hardening for 600+ student scale and growing school data.
CREATE INDEX IF NOT EXISTS idx_students_public_stats ON students(status, gender, religion, class_name);
CREATE INDEX IF NOT EXISTS idx_students_attendance_roster ON students(status, class_name, section, roll_no, name_bn);
CREATE INDEX IF NOT EXISTS idx_attendance_date_student_status ON attendance(attendance_date, student_id, status);
CREATE INDEX IF NOT EXISTS idx_marks_student_subject ON marks(student_id, subject_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_paid_at ON fee_payments(fee_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_fees_student_due_status ON fees(student_id, due_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
