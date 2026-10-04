-- V49: operational scholarship and co-curricular records
CREATE TABLE IF NOT EXISTS scholarship_awards (
 id BIGSERIAL PRIMARY KEY,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 scholarship_name VARCHAR(180) NOT NULL,
 academic_year INT NOT NULL,
 provider VARCHAR(180),
 amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK(amount>=0),
 award_date DATE,
 status VARCHAR(30) NOT NULL DEFAULT 'awarded' CHECK(status IN ('awarded','pending','cancelled')),
 notes TEXT,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scholarship_student_year ON scholarship_awards(student_id,academic_year);
CREATE INDEX IF NOT EXISTS idx_scholarship_year_status ON scholarship_awards(academic_year,status);

CREATE TABLE IF NOT EXISTS event_participants (
 id BIGSERIAL PRIMARY KEY,
 content_id BIGINT NOT NULL REFERENCES school_content_items(id) ON DELETE CASCADE,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 role VARCHAR(100),
 position VARCHAR(100),
 notes TEXT,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(content_id,student_id)
);
CREATE INDEX IF NOT EXISTS idx_event_participants_content ON event_participants(content_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_student ON event_participants(student_id);
