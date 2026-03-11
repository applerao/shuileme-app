-- 睡了么 API 数据库初始化脚本
-- PostgreSQL 15

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建枚举类型
CREATE TYPE checkin_status AS ENUM ('completed', 'missed', 'pending');
CREATE TYPE supervision_status AS ENUM ('pending', 'active', 'rejected', 'cancelled');
CREATE TYPE achievement_type AS ENUM ('checkin_streak', 'total_checkins', 'early_bird', 'night_owl', 'quality_sleep', 'supervision');
CREATE TYPE notification_type AS ENUM ('checkin_reminder', 'supervision_request', 'supervision_accepted', 'supervision_rejected', 'achievement_unlocked', 'system');

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar TEXT,
    total_checkin_days INTEGER DEFAULT 0,
    continuous_checkin_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_checkin_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 打卡记录表
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    checkin_time TIME,
    status checkin_status DEFAULT 'pending',
    note TEXT,
    sleep_quality INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    supervised_by UUID,
    UNIQUE (user_id, checkin_date)
);

-- 监督关系表
CREATE TABLE supervisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status supervision_status DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    UNIQUE (supervisor_id, supervisee_id)
);

-- 睡眠记录表
CREATE TABLE sleep_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bedtime TIMESTAMP NOT NULL,
    wake_time TIMESTAMP NOT NULL,
    sleep_duration INTEGER NOT NULL,
    deep_sleep_duration INTEGER,
    light_sleep_duration INTEGER,
    awake_duration INTEGER,
    sleep_quality INTEGER DEFAULT 0,
    note TEXT,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成就表
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type achievement_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP,
    progress INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_checkin_date ON checkins(checkin_date);
CREATE INDEX idx_supervisions_supervisor_id ON supervisions(supervisor_id);
CREATE INDEX idx_supervisions_supervisee_id ON supervisions(supervisee_id);
CREATE INDEX idx_supervisions_status ON supervisions(status);
CREATE INDEX idx_sleep_records_user_id ON sleep_records(user_id);
CREATE INDEX idx_sleep_records_record_date ON sleep_records(record_date);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_is_unlocked ON achievements(is_unlocked);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表添加触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 supervisions 表添加触发器
CREATE TRIGGER update_supervisions_updated_at
    BEFORE UPDATE ON supervisions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据（可选）
-- INSERT INTO users (username, email, password, nickname) 
-- VALUES ('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', '管理员');
