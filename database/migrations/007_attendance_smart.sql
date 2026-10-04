CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_students_active_class ON students(status, class_name, section, roll_no);
DO $$ BEGIN ALTER TABLE attendance ADD CONSTRAINT attendance_status_check CHECK (status IN ('present','absent','late','leave')) NOT VALID; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
