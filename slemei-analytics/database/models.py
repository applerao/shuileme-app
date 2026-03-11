"""
睡了么数据分析系统 - 数据模型
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Time, Text, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship, declarative_base
import json

Base = declarative_base()


class User(Base):
    """用户模型"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(64), unique=True, nullable=False, index=True)
    device_id = Column(String(64))
    platform = Column(String(32))  # ios, android, web
    app_version = Column(String(32))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    timezone = Column(String(64), default='Asia/Shanghai')
    age_group = Column(String(16))  # 18-24, 25-34, 35-44, 45+
    gender = Column(String(16))
    
    # 关系
    sleep_records = relationship("SleepRecord", back_populates="user")
    activities = relationship("UserActivity", back_populates="user")
    feature_usages = relationship("FeatureUsage", back_populates="user")
    events = relationship("TrackingEvent", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.user_id}>"


class SleepRecord(Base):
    """睡眠记录模型"""
    __tablename__ = 'sleep_records'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(64), ForeignKey('users.user_id'), nullable=False)
    session_id = Column(String(64), unique=True, nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    quality_score = Column(Integer)  # 0-100
    deep_sleep_minutes = Column(Integer)
    light_sleep_minutes = Column(Integer)
    rem_sleep_minutes = Column(Integer)
    awake_times = Column(Integer, default=0)
    入睡时间 = Column(Time)
    起床时间 = Column(Time)
    tags = Column(Text)  # JSON array
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="sleep_records")
    
    __table_args__ = (
        Index('idx_sleep_user_time', 'user_id', 'start_time'),
    )
    
    def get_tags(self):
        """解析 tags JSON"""
        if self.tags:
            return json.loads(self.tags)
        return []
    
    def __repr__(self):
        return f"<SleepRecord {self.session_id} {self.duration_minutes}min>"


class UserActivity(Base):
    """用户活跃记录模型"""
    __tablename__ = 'user_activity'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(64), ForeignKey('users.user_id'), nullable=False)
    activity_date = Column(Date, nullable=False, index=True)
    login_count = Column(Integer, default=1)
    session_duration_minutes = Column(Integer, default=0)
    screen_views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="activities")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'activity_date', name='uq_user_date'),
    )
    
    def __repr__(self):
        return f"<UserActivity {self.user_id} {self.activity_date}>"


class FeatureUsage(Base):
    """功能使用记录模型"""
    __tablename__ = 'feature_usage'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(64), ForeignKey('users.user_id'), nullable=False)
    feature_name = Column(String(64), nullable=False, index=True)
    action = Column(String(32))  # view, click, complete
    duration_seconds = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 关系
    user = relationship("User", back_populates="feature_usages")
    
    def __repr__(self):
        return f"<FeatureUsage {self.feature_name} {self.action}>"


class TrackingEvent(Base):
    """事件埋点模型"""
    __tablename__ = 'tracking_events'
    
    id = Column(Integer, primary_key=True)
    event_id = Column(String(64), unique=True, nullable=False)
    user_id = Column(String(64), ForeignKey('users.user_id'), nullable=False)
    event_name = Column(String(64), nullable=False, index=True)
    event_type = Column(String(32))  # pageview, click, custom
    properties = Column(Text)  # JSON
    session_id = Column(String(64))
    device_id = Column(String(64))
    platform = Column(String(32))
    app_version = Column(String(32))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # 关系
    user = relationship("User", back_populates="events")
    
    def get_properties(self):
        """解析 properties JSON"""
        if self.properties:
            return json.loads(self.properties)
        return {}
    
    def __repr__(self):
        return f"<TrackingEvent {self.event_name}>"


class ABTestAssignment(Base):
    """A/B 测试分组模型"""
    __tablename__ = 'ab_test_assignments'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(64), ForeignKey('users.user_id'), nullable=False)
    test_name = Column(String(64), nullable=False, index=True)
    variant = Column(String(32), nullable=False)  # control, variant_a, variant_b
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'test_name', name='uq_user_test'),
    )
    
    def __repr__(self):
        return f"<ABTestAssignment {self.test_name} {self.variant}>"


class ABTestResult(Base):
    """A/B 测试结果模型"""
    __tablename__ = 'ab_test_results'
    
    id = Column(Integer, primary_key=True)
    test_name = Column(String(64), nullable=False, index=True)
    variant = Column(String(32), nullable=False)
    metric_name = Column(String(64), nullable=False)
    metric_value = Column(Float, nullable=False)
    sample_size = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ABTestResult {self.test_name} {self.variant} {self.metric_value}>"


class UserRetention(Base):
    """用户留存物化表"""
    __tablename__ = 'user_retention'
    
    id = Column(Integer, primary_key=True)
    cohort_date = Column(Date, nullable=False, index=True)
    days_since_signup = Column(Integer, nullable=False)
    total_users = Column(Integer, nullable=False)
    retained_users = Column(Integer, nullable=False)
    retention_rate = Column(Float)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('cohort_date', 'days_since_signup', name='uq_cohort_days'),
    )
    
    def __repr__(self):
        return f"<UserRetention {self.cohort_date} D{self.days_since_signup} {self.retention_rate:.2%}>"


class DailyStats(Base):
    """每日统计汇总表"""
    __tablename__ = 'daily_stats'
    
    id = Column(Integer, primary_key=True)
    stat_date = Column(Date, unique=True, nullable=False, index=True)
    dau = Column(Integer, default=0)
    mau = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    total_sleep_sessions = Column(Integer, default=0)
    avg_sleep_duration = Column(Float)
    avg_quality_score = Column(Float)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<DailyStats {self.stat_date} DAU:{self.dau}>"
