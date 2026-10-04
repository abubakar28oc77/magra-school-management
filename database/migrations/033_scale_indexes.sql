-- V33: Scale-readiness for a growing school population
CREATE INDEX IF NOT EXISTS idx_students_class_section_name ON students(class_name, section, name_bn);
CREATE INDEX IF NOT EXISTS idx_students_status_class_roll ON students(status, class_name, roll_no);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_guardian_phone ON students(guardian_phone);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers(name_bn);
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(name_bn);
