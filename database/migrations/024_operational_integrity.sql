-- V65 — operational integrity constraints for active facility assignments
-- Deactivate duplicate active assignments before adding partial unique indexes.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY assigned_at DESC, id DESC) rn
  FROM transport_assignments WHERE status='active'
)
UPDATE transport_assignments t SET status='inactive' FROM ranked r WHERE t.id=r.id AND r.rn>1;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY assigned_at DESC, id DESC) rn
  FROM hostel_assignments WHERE status='active'
)
UPDATE hostel_assignments t SET status='inactive' FROM ranked r WHERE t.id=r.id AND r.rn>1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_transport_active_student
  ON transport_assignments(student_id) WHERE status='active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_hostel_active_student
  ON hostel_assignments(student_id) WHERE status='active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_hostel_active_bed
  ON hostel_assignments(room_id,bed_no) WHERE status='active' AND bed_no IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_school_content_public
  ON school_content_items(status,content_type,sort_order,event_date DESC);
