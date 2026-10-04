-- V17: Notifications & Communication
CREATE TABLE IF NOT EXISTS notifications(
 id BIGSERIAL PRIMARY KEY,
 recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title_bn VARCHAR(250) NOT NULL,
 title_en VARCHAR(250),
 body TEXT,
 type VARCHAR(40) NOT NULL DEFAULT 'general',
 priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
 entity_type VARCHAR(60),
 entity_id VARCHAR(100),
 action_url TEXT,
 is_read BOOLEAN NOT NULL DEFAULT FALSE,
 read_at TIMESTAMPTZ,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id,is_read,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type,created_at DESC);

CREATE TABLE IF NOT EXISTS notification_preferences(
 id BIGSERIAL PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 channel VARCHAR(20) NOT NULL DEFAULT 'in_app' CHECK(channel IN ('in_app','email','sms','push')),
 notification_type VARCHAR(40) NOT NULL DEFAULT 'general',
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(user_id,channel,notification_type)
);

CREATE TABLE IF NOT EXISTS communication_messages(
 id BIGSERIAL PRIMARY KEY,
 sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
 recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 recipient_group VARCHAR(30),
 subject_bn VARCHAR(250),
 body TEXT NOT NULL,
 channel VARCHAR(20) NOT NULL DEFAULT 'in_app' CHECK(channel IN ('in_app','email','sms','push')),
 status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sent','failed')),
 sent_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(recipient_user_id IS NOT NULL OR recipient_group IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_communication_messages_sender ON communication_messages(sender_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communication_messages_recipient ON communication_messages(recipient_user_id,created_at DESC);
