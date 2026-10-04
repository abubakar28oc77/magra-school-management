-- V86: configurable feature registry and custom feature shortcuts
CREATE TABLE IF NOT EXISTS system_features(
 id BIGSERIAL PRIMARY KEY,
 feature_key VARCHAR(160) NOT NULL UNIQUE,
 scope VARCHAR(20) NOT NULL CHECK(scope IN ('admin','public')),
 feature_type VARCHAR(30) NOT NULL DEFAULT 'module',
 label_bn VARCHAR(180) NOT NULL,
 label_en VARCHAR(180),
 group_name VARCHAR(120),
 icon VARCHAR(20),
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 sort_order INT NOT NULL DEFAULT 0,
 is_system BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_system_features_scope_order ON system_features(scope,enabled,sort_order);

CREATE TABLE IF NOT EXISTS custom_features(
 id BIGSERIAL PRIMARY KEY,
 title_bn VARCHAR(180) NOT NULL,
 title_en VARCHAR(180),
 description TEXT,
 icon VARCHAR(20) DEFAULT '✨',
 target_url TEXT NOT NULL,
 placement VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK(placement IN ('admin','public','both')),
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 sort_order INT NOT NULL DEFAULT 0,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_custom_features_enabled ON custom_features(placement,enabled,sort_order);

INSERT INTO system_features(feature_key,scope,feature_type,label_bn,label_en,group_name,icon,sort_order,is_system) VALUES
('admin.dashboard','admin','module','ড্যাশবোর্ড','Dashboard','সারাংশ','📊',10,true),
('admin.students','admin','module','শিক্ষার্থী','Students','একাডেমিক','🎓',20,true),
('admin.staff','admin','module','শিক্ষক ও কর্মচারী','Teachers & Staff','একাডেমিক','👨‍🏫',30,true),
('admin.admission','admin','module','ভর্তি','Admission','একাডেমিক','📝',40,true),
('admin.attendance','admin','module','উপস্থিতি','Attendance','একাডেমিক','🕘',50,true),
('admin.results','admin','module','পরীক্ষা ও ফলাফল','Exams & Results','একাডেমিক','📈',60,true),
('admin.routine','admin','module','রুটিন','Routine','একাডেমিক','🗓️',70,true),
('admin.finance','admin','module','ফি ও হিসাব','Finance','প্রশাসন','💳',80,true),
('admin.library','admin','module','লাইব্রেরি','Library','প্রশাসন','📚',90,true),
('admin.notice','admin','module','নোটিশ','Notice','যোগাযোগ','📢',100,true),
('admin.notifications','admin','module','নোটিফিকেশন','Notifications','যোগাযোগ','🔔',110,true),
('admin.learning','admin','module','ডিজিটাল লার্নিং','Digital Learning','শিক্ষা','💻',120,true),
('admin.question','admin','module','প্রশ্নব্যাংক','Question Bank','শিক্ষা','❓',130,true),
('admin.assignment','admin','module','অ্যাসাইনমেন্ট','Assignment','শিক্ষা','📘',140,true),
('admin.online_exam','admin','module','অনলাইন পরীক্ষা','Online Exam','শিক্ষা','🧪',150,true),
('admin.ai','admin','module','AI শিক্ষা','AI Education','স্মার্ট ফিচার','✨',160,true),
('admin.reports','admin','module','রিপোর্ট','Reports','রিপোর্ট','📑',170,true),
('admin.documents','admin','module','ডকুমেন্ট ও প্রিন্ট','Documents & Print','রিপোর্ট','🖨️',180,true),
('admin.users','admin','module','ইউজার ও রোল','Users & Roles','নিরাপত্তা','👥',190,true),
('admin.content','admin','module','সহশিক্ষা ও অর্জন','School Life CMS','কনটেন্ট','🏆',200,true),
('admin.transport','admin','module','পরিবহন','Transport','সুবিধা','🚌',210,true),
('admin.hostel','admin','module','হোস্টেল','Hostel','সুবিধা','🛏️',220,true),
('admin.settings','admin','module','সেটিংস','Settings','নিরাপত্তা','⚙️',230,true),
('admin.feature_control','admin','module','ফিচার কন্ট্রোল','Feature Control','নিরাপত্তা','🧩',240,true),
('public.nav.home','public','nav','হোম','Home','প্রধান মেনু','🏠',10,true),
('public.nav.institution','public','nav','প্রাতিষ্ঠানিক তথ্য','Institution','প্রধান মেনু','🏛️',20,true),
('public.nav.sport','public','nav','ক্রীড়া ও সংস্কৃতি','Sports & Culture','প্রধান মেনু','⚽',30,true),
('public.nav.staff','public','nav','শিক্ষক ও কর্মচারী','Teachers & Staff','প্রধান মেনু','👨‍🏫',40,true),
('public.nav.students','public','nav','শিক্ষার্থীর তথ্য','Students','প্রধান মেনু','🎓',50,true),
('public.nav.results','public','nav','পরীক্ষার ফলাফল','Results','প্রধান মেনু','📊',60,true),
('public.nav.guide','public','nav','শিক্ষার্থীর গাইড','Student Guide','প্রধান মেনু','📚',70,true),
('public.nav.notice','public','nav','নোটিশ','Notice','প্রধান মেনু','📢',80,true),
('public.nav.gallery','public','nav','গ্যালারি','Gallery','প্রধান মেনু','🖼️',90,true),
('public.nav.contact','public','nav','যোগাযোগ','Contact','প্রধান মেনু','☎️',100,true),
('public.nav.login','public','nav','লগইন','Login','প্রধান মেনু','🔐',110,true)
ON CONFLICT(feature_key) DO NOTHING;
