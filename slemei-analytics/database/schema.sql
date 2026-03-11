-- 睡了么数据分析系统 - 数据库 Schema
-- PostgreSQL / SQLite 兼容

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    device_id VARCHAR(64),
    platform VARCHAR(32),  -- ios, android, web
    app_version VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timezone VARCHAR(64) DEFAULT 'Asia/Shanghai',
    age_group VARCHAR(16),  -- 18-24, 25-34, 35-44, 45+
    gender VARCHAR(16)
);

-- 睡眠记录表
CREATE TABLE IF NOT EXISTS sleep_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64) UNIQUE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    quality_score INTEGER,  -- 0-100
    deep_sleep_minutes INTEGER,
    light_sleep_minutes INTEGER,
    rem_sleep_minutes INTEGER,
    awake_times INTEGER DEFAULT 0,
   入睡_time TIME,
    起床时间 TIME,
    tags TEXT,  -- JSON array of tags
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 用户活跃记录表
CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    activity_date DATE NOT NULL,
    login_count INTEGER DEFAULT 1,
    session_duration_minutes INTEGER DEFAULT 0,
    screen_views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 功能使用记录表
CREATE TABLE IF NOT EXISTS feature_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    feature_name VARCHAR(64) NOT NULL,
    action VARCHAR(32),  -- view, click, complete
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 事件埋点表
CREATE TABLE IF NOT EXISTS tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    event_name VARCHAR(64) NOT NULL,
    event_type VARCHAR(32),  -- pageview, click, custom
    properties TEXT,  -- JSON
    session_id VARCHAR(64),
    device_id VARCHAR(64),
    platform VARCHAR(32),
    app_version VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- A/B 测试分组表
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    test_name VARCHAR(64) NOT NULL,
    variant VARCHAR(32) NOT NULL,  -- control, variant_a, variant_b
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, test_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- A/B 测试结果表
CREATE TABLE IF NOT EXISTS ab_test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_name VARCHAR(64) NOT NULL,
    variant VARCHAR(32) NOT NULL,
    metric_name VARCHAR(64) NOT NULL,
    metric_value REAL NOT NULL,
    sample_size INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户留存表（物化视图）
CREATE TABLE IF NOT EXISTS user_retention (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cohort_date DATE NOT NULL,
    days_since_signup INTEGER NOT NULL,
    total_users INTEGER NOT NULL,
    retained_users INTEGER NOT NULL,
    retention_rate REAL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cohort_date, days_since_signup)
);

-- 每日统计汇总表
CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_date DATE UNIQUE NOT NULL,
    dau INTEGER DEFAULT 0,
    mau INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_sleep_sessions INTEGER DEFAULT 0,
    avg_sleep_duration REAL,
    avg_quality_score REAL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sleep_records_user ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_start ON sleep_records(start_time);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON user_activity(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_feature_user ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON tracking_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_user ON ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date);
