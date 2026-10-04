-- V23 routine integrity and lookup indexes
CREATE INDEX IF NOT EXISTS idx_routines_class_day_time ON routines(class_name,section,day_of_week,start_time);
CREATE INDEX IF NOT EXISTS idx_routines_teacher_day_time ON routines(teacher_id,day_of_week,start_time);
-- Prevent exact duplicate slots for the same class/section.
CREATE UNIQUE INDEX IF NOT EXISTS uq_routine_exact_slot ON routines(class_name,(COALESCE(section,'')),day_of_week,start_time,end_time);
