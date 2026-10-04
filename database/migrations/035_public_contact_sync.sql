-- V111: Public contact directory automatically sourced from active teacher/staff profiles.
-- A contact role may be explicitly assigned; otherwise the system infers it from designation/subject.
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS public_contact_role VARCHAR(40);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS public_contact_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS public_contact_role VARCHAR(40);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS public_contact_enabled BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_teachers_public_contact ON teachers(status, public_contact_role, public_contact_enabled);
CREATE INDEX IF NOT EXISTS idx_staff_public_contact ON staff(status, public_contact_role, public_contact_enabled);
