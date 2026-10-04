-- V114: teacher directory timestamps required for dynamic public contact ordering.
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_teachers_updated_at ON teachers(updated_at DESC);
