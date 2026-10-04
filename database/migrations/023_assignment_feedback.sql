-- V51: teacher feedback for assignment submissions
ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);
