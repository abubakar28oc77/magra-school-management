-- V91: Form Builder metadata + custom fields for Student/Teacher/Staff forms
ALTER TABLE system_features ADD COLUMN IF NOT EXISTS parent_key VARCHAR(160);
CREATE INDEX IF NOT EXISTS idx_system_features_parent ON system_features(parent_key);

CREATE TABLE IF NOT EXISTS form_fields (
  id BIGSERIAL PRIMARY KEY,
  form_key VARCHAR(30) NOT NULL CHECK (form_key IN ('student','teacher','staff')),
  field_key VARCHAR(120) NOT NULL,
  label_bn VARCHAR(180) NOT NULL,
  label_en VARCHAR(180),
  field_type VARCHAR(30) NOT NULL DEFAULT 'text' CHECK (field_type IN ('text','number','date','email','tel','textarea','select','checkbox','file')),
  section_name VARCHAR(120) NOT NULL DEFAULT 'অতিরিক্ত তথ্য',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(form_key, field_key)
);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_order ON form_fields(form_key,enabled,sort_order,id);

INSERT INTO form_fields(form_key,field_key,label_bn,label_en,field_type,section_name,required,enabled,sort_order,is_system)
VALUES
('student','student_id','Student ID','Student ID','text','ব্যক্তিগত তথ্য',true,true,10,true),
('student','name_bn','শিক্ষার্থীর নাম (বাংলা)','Student Name (Bangla)','text','ব্যক্তিগত তথ্য',true,true,20,true),
('student','name_en','শিক্ষার্থীর নাম (ইংরেজি)','Student Name (English)','text','ব্যক্তিগত তথ্য',false,true,30,true),
('student','date_of_birth','জন্ম তারিখ','Date of Birth','date','ব্যক্তিগত তথ্য',true,true,40,true),
('student','class_name','শ্রেণি','Class','select','একাডেমিক তথ্য',true,true,50,true),
('student','section','বিভাগ/শাখা','Section','text','একাডেমিক তথ্য',false,true,60,true),
('student','roll_no','রোল নম্বর','Roll No','text','একাডেমিক তথ্য',false,true,70,true),
('student','guardian_phone','অভিভাবকের মোবাইল','Guardian Mobile','tel','অভিভাবক তথ্য',false,true,80,true),
('teacher','employee_id','Employee ID','Employee ID','text','পরিচয়',true,true,10,true),
('teacher','name_bn','নাম (বাংলা)','Name (Bangla)','text','পরিচয়',true,true,20,true),
('teacher','designation','পদবী','Designation','text','চাকরি ও MPO',true,true,30,true),
('teacher','subject','মূল বিষয়','Subject','text','চাকরি ও MPO',false,true,40,true),
('teacher','phone','মোবাইল','Mobile','tel','যোগাযোগ',false,true,50,true),
('staff','employee_id','Employee ID','Employee ID','text','পরিচয়',true,true,10,true),
('staff','name_bn','নাম (বাংলা)','Name (Bangla)','text','পরিচয়',true,true,20,true),
('staff','designation','পদবী','Designation','text','চাকরি',true,true,30,true),
('staff','phone','মোবাইল','Mobile','tel','যোগাযোগ',false,true,40,true)
ON CONFLICT(form_key,field_key) DO NOTHING;
