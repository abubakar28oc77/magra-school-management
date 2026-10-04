-- V48: operational transport and hostel management
CREATE TABLE IF NOT EXISTS transport_vehicles (
 id BIGSERIAL PRIMARY KEY, vehicle_no VARCHAR(60) UNIQUE NOT NULL, vehicle_type VARCHAR(40) NOT NULL DEFAULT 'bus', capacity INT NOT NULL DEFAULT 0 CHECK(capacity>=0), driver_name VARCHAR(180), driver_phone VARCHAR(40), route_name VARCHAR(180), active BOOLEAN NOT NULL DEFAULT TRUE, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS transport_assignments (
 id BIGSERIAL PRIMARY KEY, vehicle_id BIGINT NOT NULL REFERENCES transport_vehicles(id) ON DELETE CASCADE, student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE, pickup_point VARCHAR(180), monthly_fee NUMERIC(10,2) DEFAULT 0 CHECK(monthly_fee>=0), status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')), assigned_at DATE NOT NULL DEFAULT CURRENT_DATE, UNIQUE(vehicle_id,student_id)
);
CREATE INDEX IF NOT EXISTS idx_transport_assignment_student ON transport_assignments(student_id,status);
CREATE TABLE IF NOT EXISTS hostel_rooms (
 id BIGSERIAL PRIMARY KEY, room_no VARCHAR(40) UNIQUE NOT NULL, building VARCHAR(100), floor_no VARCHAR(30), capacity INT NOT NULL DEFAULT 0 CHECK(capacity>=0), gender VARCHAR(30), supervisor_name VARCHAR(180), active BOOLEAN NOT NULL DEFAULT TRUE, notes TEXT
);
CREATE TABLE IF NOT EXISTS hostel_assignments (
 id BIGSERIAL PRIMARY KEY, room_id BIGINT NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE, student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE, bed_no VARCHAR(30), monthly_fee NUMERIC(10,2) DEFAULT 0 CHECK(monthly_fee>=0), status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')), assigned_at DATE NOT NULL DEFAULT CURRENT_DATE, UNIQUE(room_id,student_id)
);
CREATE INDEX IF NOT EXISTS idx_hostel_assignment_student ON hostel_assignments(student_id,status);
