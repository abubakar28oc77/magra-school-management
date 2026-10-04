CREATE TABLE IF NOT EXISTS school_content_items (
 id BIGSERIAL PRIMARY KEY,
 content_type VARCHAR(30) NOT NULL CHECK (content_type IN ('event','achievement','scholarship','facility')),
 title_bn VARCHAR(220) NOT NULL,
 title_en VARCHAR(220),
 description TEXT,
 event_date DATE,
 location VARCHAR(180),
 status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
 sort_order INT NOT NULL DEFAULT 0,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_school_content_type_status ON school_content_items(content_type,status,sort_order,event_date DESC);
