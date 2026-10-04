-- V102: guardian account provisioning from student profile
-- Guardian accounts are users with role=guardian and are linked through guardian_student_links.
CREATE INDEX IF NOT EXISTS idx_users_guardian_phone ON users(phone) WHERE phone IS NOT NULL;
