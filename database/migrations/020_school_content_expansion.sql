-- V36: expand public school-life content and gallery metadata
ALTER TABLE school_content_items DROP CONSTRAINT IF EXISTS school_content_items_content_type_check;
ALTER TABLE school_content_items ADD CONSTRAINT school_content_items_content_type_check
CHECK (content_type IN ('event','achievement','scholarship','facility','institution','sport','gallery','transport','hostel','club','library_info'));
ALTER TABLE school_content_items ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_school_content_gallery ON school_content_items(content_type,status,event_date DESC);
