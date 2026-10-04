CREATE TABLE IF NOT EXISTS admission_applications(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 application_no VARCHAR(50) UNIQUE NOT NULL,
 academic_year INT NOT NULL,
 applied_class VARCHAR(30) NOT NULL,
 applicant_name_bn VARCHAR(180) NOT NULL,
 applicant_name_en VARCHAR(180),
 date_of_birth DATE,
 gender VARCHAR(30),
 birth_registration_no VARCHAR(80),
 father_name VARCHAR(180),
 mother_name VARCHAR(180),
 guardian_name VARCHAR(180),
 guardian_phone VARCHAR(40) NOT NULL,
 guardian_email VARCHAR(180),
 address TEXT,
 previous_school VARCHAR(250),
 quota VARCHAR(80),
 application_date DATE NOT NULL DEFAULT CURRENT_DATE,
 status VARCHAR(30) NOT NULL DEFAULT 'submitted',
 admission_test_mark NUMERIC(8,2),
 payment_amount NUMERIC(12,2) DEFAULT 0,
 payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
 notes TEXT,
 converted_student_id UUID REFERENCES students(id) ON DELETE SET NULL,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admission_year_class ON admission_applications(academic_year, applied_class);
CREATE INDEX IF NOT EXISTS idx_admission_status ON admission_applications(status);
CREATE INDEX IF NOT EXISTS idx_admission_phone ON admission_applications(guardian_phone);
