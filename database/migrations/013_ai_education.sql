-- V14: AI Education, study plans and learning analytics foundation
CREATE TABLE IF NOT EXISTS ai_conversations(
 id BIGSERIAL PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title VARCHAR(200),
 language VARCHAR(10) NOT NULL DEFAULT 'bn',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ai_messages(
 id BIGSERIAL PRIMARY KEY,
 conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
 role VARCHAR(20) NOT NULL CHECK(role IN ('user','assistant','system')),
 message TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id,created_at);
CREATE TABLE IF NOT EXISTS study_plans(
 id BIGSERIAL PRIMARY KEY,
 student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 title_bn VARCHAR(250) NOT NULL,
 goal TEXT,
 start_date DATE NOT NULL,
 end_date DATE NOT NULL,
 plan_json JSONB NOT NULL DEFAULT '[]'::jsonb,
 status VARCHAR(20) NOT NULL DEFAULT 'active',
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_plans_student ON study_plans(student_id,status);
CREATE TABLE IF NOT EXISTS ai_feedback(
 id BIGSERIAL PRIMARY KEY,
 student_id UUID REFERENCES students(id) ON DELETE CASCADE,
 topic VARCHAR(200),
 feedback_type VARCHAR(50),
 feedback TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_student ON ai_feedback(student_id,created_at DESC);
