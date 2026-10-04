-- V10 Finance & Library enhancements
CREATE TABLE IF NOT EXISTS fee_payments(
 id BIGSERIAL PRIMARY KEY, fee_id BIGINT NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
 amount NUMERIC(12,2) NOT NULL CHECK(amount>0), payment_method VARCHAR(30) DEFAULT 'cash',
 reference VARCHAR(120), paid_at TIMESTAMPTZ DEFAULT NOW(), received_by UUID REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS expenses(
 id BIGSERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, category VARCHAR(100), amount NUMERIC(12,2) NOT NULL CHECK(amount>0),
 expense_date DATE DEFAULT CURRENT_DATE, notes TEXT, created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee ON fee_payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
