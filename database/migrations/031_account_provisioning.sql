-- V101: direct account provisioning and one-to-one profile identity links
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_user_id ON students(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_teachers_user_id ON teachers(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_user_id ON staff(user_id) WHERE user_id IS NOT NULL;
