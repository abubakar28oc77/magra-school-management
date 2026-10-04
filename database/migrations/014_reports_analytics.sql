-- V15: Advanced Reports & Analytics
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_marks_student_exam ON marks(student_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_paid_at ON fee_payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_loans_student_returned ON library_loans(student_id, returned_at);
CREATE INDEX IF NOT EXISTS idx_admission_application_date ON admission_applications(application_date DESC);
