"""
睡了么数据分析系统 - 事件埋点模块

功能：
- 关键事件埋点定义
- 事件采集与存储
- 事件查询与分析
"""
import uuid
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
import sys
import os

sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.models import TrackingEvent, User
from database.connection import get_db_session
from config.config import TRACKING_CONFIG


class EventTracker:
    """事件追踪器"""
    
    def __init__(self, session: Session):
        self.session = session
        self.config = TRACKING_CONFIG
        self.event_queue = []
    
    def track_event(
        self,
        event_name: str,
        user_id: str,
        event_type: str = "custom",
        properties: Dict = None,
        session_id: str = None,
        device_id: str = None,
        platform: str = None,
        app_version: str = None
    ) -> str:
        """
        追踪单个事件
        
        Args:
            event_name: 事件名称
            user_id: 用户 ID
            event_type: 事件类型 (pageview, click, custom)
            properties: 事件属性
            session_id: 会话 ID
            device_id: 设备 ID
            platform: 平台
            app_version: App 版本
            
        Returns:
            event_id
        """
        if not self.config["enabled"]:
            return None
        
        event_id = str(uuid.uuid4())
        
        event = TrackingEvent(
            event_id=event_id,
            user_id=user_id,
            event_name=event_name,
            event_type=event_type,
            properties=json.dumps(properties) if properties else None,
            session_id=session_id,
            device_id=device_id,
            platform=platform,
            app_version=app_version
        )
        
        self.session.add(event)
        self.session.commit()
        
        return event_id
    
    def track_batch(self, events: List[Dict]) -> int:
        """
        批量追踪事件
        
        Args:
            events: List of event dicts
            
        Returns:
            Number of events tracked
        """
        if not self.config["enabled"]:
            return 0
        
        count = 0
        for event_data in events:
            try:
                self.track_event(**event_data)
                count += 1
            except Exception as e:
                print(f"Event tracking failed: {e}")
        
        return count
    
    def get_events(
        self,
        event_name: str = None,
        user_id: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        limit: int = 1000
    ) -> List[TrackingEvent]:
        """
        查询事件
        
        Args:
            event_name: 事件名称过滤
            user_id: 用户 ID 过滤
            start_date: 开始日期
            end_date: 结束日期
            limit: 返回数量限制
            
        Returns:
            List of TrackingEvent
        """
        query = self.session.query(TrackingEvent)
        
        if event_name:
            query = query.filter(TrackingEvent.event_name == event_name)
        
        if user_id:
            query = query.filter(TrackingEvent.user_id == user_id)
        
        if start_date:
            query = query.filter(TrackingEvent.created_at >= start_date)
        
        if end_date:
            query = query.filter(TrackingEvent.created_at <= end_date)
        
        return query.order_by(TrackingEvent.created_at.desc()).limit(limit).all()
    
    def get_event_count(
        self,
        event_name: str = None,
        user_id: str = None,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> int:
        """
        查询事件数量
        
        Returns:
            Event count
        """
        query = self.session.query(func.count(TrackingEvent.id))
        
        if event_name:
            query = query.filter(TrackingEvent.event_name == event_name)
        
        if user_id:
            query = query.filter(TrackingEvent.user_id == user_id)
        
        if start_date:
            query = query.filter(TrackingEvent.created_at >= start_date)
        
        if end_date:
            query = query.filter(TrackingEvent.created_at <= end_date)
        
        return query.scalar() or 0
    
    def get_event_trend(
        self,
        event_name: str,
        days: int = 30,
        group_by: str = "day"
    ) -> List[Dict]:
        """
        获取事件趋势
        
        Args:
            event_name: 事件名称
            days: 天数
            group_by: day, hour, week
            
        Returns:
            List of {date, count}
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        if group_by == "day":
            date_func = func.date(TrackingEvent.created_at)
        elif group_by == "hour":
            date_func = func.strftime('%Y-%m-%d %H:00', TrackingEvent.created_at)
        elif group_by == "week":
            date_func = func.strftime('%Y-%W', TrackingEvent.created_at)
        else:
            date_func = func.date(TrackingEvent.created_at)
        
        trend_data = self.session.query(
            date_func.label('date'),
            func.count(TrackingEvent.id).label('count')
        ).filter(
            TrackingEvent.event_name == event_name,
            TrackingEvent.created_at >= start_date
        ).group_by(
            date_func
        ).order_by(
            date_func
        ).all()
        
        return [{"date": str(d), "count": c} for d, c in trend_data]


# 预定义事件
class PredefinedEvents:
    """预定义事件常量"""
    
    # App 生命周期
    APP_OPEN = "app_open"
    APP_CLOSE = "app_close"
    APP_BACKGROUND = "app_background"
    APP_FOREGROUND = "app_foreground"
    
    # 睡眠相关
    SLEEP_START = "sleep_start"
    SLEEP_END = "sleep_end"
    SLEEP_EDIT = "sleep_edit"
    SLEEP_DELETE = "sleep_delete"
    
    # 质量评分
    QUALITY_RATE = "quality_rate"
    
    # 功能使用
    FEATURE_USE = "feature_use"
    REPORT_VIEW = "report_view"
    SETTING_CHANGE = "setting_change"
    
    # 转化相关
    SIGNUP_START = "signup_start"
    SIGNUP_COMPLETE = "signup_complete"
    PAYMENT_START = "payment_start"
    PAYMENT_COMPLETE = "payment_complete"
    
    # 导出分享
    EXPORT_DATA = "export_data"
    SHARE_REPORT = "share_report"


def main():
    """主函数 - 演示用法"""
    from datetime import timedelta
    
    with get_db_session() as session:
        tracker = EventTracker(session)
        
        print("=" * 60)
        print("事件埋点演示")
        print("=" * 60)
        
        # 追踪示例事件
        event_id = tracker.track_event(
            event_name=PredefinedEvents.APP_OPEN,
            user_id="test_user_001",
            event_type="pageview",
            properties={"source": "notification"},
            platform="ios",
            app_version="1.0.0"
        )
        print(f"\n✓ 事件追踪：{event_id}")
        
        # 查询事件
        events = tracker.get_events(user_id="test_user_001", limit=5)
        print(f"✓ 查询到 {len(events)} 个事件")
        
        # 事件计数
        count = tracker.get_event_count(event_name=PredefinedEvents.APP_OPEN)
        print(f"✓ APP_OPEN 事件总数：{count}")
        
        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
