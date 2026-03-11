"""
睡了么数据分析系统 - 用户行为分析模块

功能：
- 日活/月活统计 (DAU/MAU)
- 用户留存分析（次日/7 日/30 日）
- 用户使用时长分布
- 功能使用频率分析
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
import sys
import os

sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.models import User, UserActivity, FeatureUsage, SleepRecord
from database.connection import get_db_session
from config.config import ANALYTICS_CONFIG


class UserBehaviorAnalytics:
    """用户行为分析类"""
    
    def __init__(self, session: Session):
        self.session = session
        self.config = ANALYTICS_CONFIG
    
    def get_dau(self, date: datetime = None) -> int:
        """
        获取日活跃用户数 (DAU)
        
        Args:
            date: 查询日期，默认今天
            
        Returns:
            DAU 数值
        """
        if date is None:
            date = datetime.now().date()
        elif isinstance(date, datetime):
            date = date.date()
        
        result = self.session.query(func.count(distinct(UserActivity.user_id))).filter(
            UserActivity.activity_date == date
        ).scalar()
        
        return result or 0
    
    def get_mau(self, end_date: datetime = None) -> int:
        """
        获取月活跃用户数 (MAU)
        
        Args:
            end_date: 结束日期，默认今天
            
        Returns:
            MAU 数值
        """
        if end_date is None:
            end_date = datetime.now()
        
        start_date = end_date - timedelta(days=30)
        
        result = self.session.query(func.count(distinct(UserActivity.user_id))).filter(
            UserActivity.activity_date >= start_date.date(),
            UserActivity.activity_date <= end_date.date()
        ).scalar()
        
        return result or 0
    
    def get_dau_mau_ratio(self, end_date: datetime = None) -> float:
        """
        获取 DAU/MAU 比率（用户粘性指标）
        
        Returns:
            比率值 (0-1)
        """
        dau = self.get_dau(end_date)
        mau = self.get_mau(end_date)
        
        if mau == 0:
            return 0.0
        
        return dau / mau
    
    def get_active_users_trend(self, days: int = 30) -> pd.DataFrame:
        """
        获取活跃用户趋势
        
        Args:
            days: 查询天数
            
        Returns:
            DataFrame with columns: date, dau, mau
        """
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # 获取每日活跃用户
        activity_data = self.session.query(
            UserActivity.activity_date,
            func.count(distinct(UserActivity.user_id)).label('dau')
        ).filter(
            UserActivity.activity_date >= start_date
        ).group_by(
            UserActivity.activity_date
        ).all()
        
        df = pd.DataFrame(activity_data, columns=['date', 'dau'])
        
        # 计算滚动 MAU
        df['mau'] = df['dau'].rolling(window=30, min_periods=1).sum()
        df['dau_mau_ratio'] = df['dau'] / df['mau'].replace(0, np.nan)
        
        return df
    
    def get_user_retention(self, cohort_date: datetime = None) -> Dict[int, float]:
        """
        获取用户留存率（次日/7 日/30 日）
        
        Args:
            cohort_date: 群组日期（用户注册日期）
            
        Returns:
            Dict: {days: retention_rate}
        """
        if cohort_date is None:
            # 默认分析 30 天前的注册用户
            cohort_date = (datetime.now() - timedelta(days=30)).date()
        elif isinstance(cohort_date, datetime):
            cohort_date = cohort_date.date()
        
        # 获取该日期注册的用户
        cohort_users = self.session.query(User.user_id).filter(
            func.date(User.created_at) == cohort_date
        ).all()
        cohort_users = [u[0] for u in cohort_users]
        
        if not cohort_users:
            return {}
        
        total_cohort = len(cohort_users)
        retention_rates = {}
        
        for days in self.config["retention_days"]:
            target_date = cohort_date + timedelta(days=days)
            
            retained_users = self.session.query(func.count(distinct(UserActivity.user_id))).filter(
                UserActivity.user_id.in_(cohort_users),
                UserActivity.activity_date == target_date
            ).scalar() or 0
            
            retention_rates[days] = retained_users / total_cohort if total_cohort > 0 else 0
        
        return retention_rates
    
    def get_retention_matrix(self, months: int = 3) -> pd.DataFrame:
        """
        获取留存矩阵（热力图数据）
        
        Args:
            months: 分析的月数
            
        Returns:
            DataFrame: 行=注册日期，列=留存天数
        """
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=months * 30)
        
        # 获取每日注册用户
        cohort_data = self.session.query(
            func.date(User.created_at).label('cohort_date'),
            User.user_id
        ).filter(
            func.date(User.created_at) >= start_date
        ).all()
        
        df = pd.DataFrame(cohort_data, columns=['cohort_date', 'user_id'])
        
        if df.empty:
            return pd.DataFrame()
        
        # 获取所有活跃记录
        activity_data = self.session.query(
            UserActivity.user_id,
            UserActivity.activity_date
        ).filter(
            UserActivity.activity_date >= start_date
        ).all()
        
        activity_df = pd.DataFrame(activity_data, columns=['user_id', 'activity_date'])
        
        # 合并数据
        merged = df.merge(activity_df, on='user_id')
        merged['days_since_signup'] = (merged['activity_date'] - merged['cohort_date']).dt.days
        
        # 计算留存率
        cohort_sizes = df.groupby('cohort_date')['user_id'].nunique().reset_index()
        cohort_sizes.columns = ['cohort_date', 'cohort_size']
        
        retention = merged.groupby(['cohort_date', 'days_since_signup'])['user_id'].nunique().reset_index()
        retention = retention.merge(cohort_sizes, on='cohort_date')
        retention['retention_rate'] = retention['user_id'] / retention['cohort_size']
        
        # 透视表
        pivot = retention.pivot(
            index='cohort_date',
            columns='days_since_signup',
            values='retention_rate'
        )
        
        # 只保留关键天数
        retention_days = self.config["retention_days"]
        available_days = [d for d in retention_days if d in pivot.columns]
        
        if available_days:
            pivot = pivot[available_days]
            pivot.columns = [f'D{int(col)}' for col in pivot.columns]
        
        return pivot
    
    def get_session_duration_distribution(self, days: int = 30) -> Dict[str, any]:
        """
        获取用户使用时长分布
        
        Args:
            days: 分析天数
            
        Returns:
            Dict with distribution stats
        """
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        activity_data = self.session.query(
            UserActivity.session_duration_minutes
        ).filter(
            UserActivity.activity_date >= start_date,
            UserActivity.session_duration_minutes > 0
        ).all()
        
        durations = [d[0] for d in activity_data if d[0]]
        
        if not durations:
            return {"count": 0}
        
        durations = np.array(durations)
        
        # 定义时间段
        bins = [0, 5, 15, 30, 60, 120, float('inf')]
        labels = ['<5 分钟', '5-15 分钟', '15-30 分钟', '30-60 分钟', '1-2 小时', '>2 小时']
        
        distribution = pd.cut(durations, bins=bins, labels=labels, right=False)
        distribution_counts = distribution.value_counts().to_dict()
        
        return {
            "count": len(durations),
            "mean": float(np.mean(durations)),
            "median": float(np.median(durations)),
            "std": float(np.std(durations)),
            "min": float(np.min(durations)),
            "max": float(np.max(durations)),
            "distribution": {str(k): v for k, v in distribution_counts.items()},
            "percentiles": {
                "p25": float(np.percentile(durations, 25)),
                "p50": float(np.percentile(durations, 50)),
                "p75": float(np.percentile(durations, 75)),
                "p90": float(np.percentile(durations, 90)),
                "p95": float(np.percentile(durations, 95))
            }
        }
    
    def get_feature_usage_frequency(self, days: int = 30) -> pd.DataFrame:
        """
        获取功能使用频率分析
        
        Args:
            days: 分析天数
            
        Returns:
            DataFrame with feature usage stats
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        feature_data = self.session.query(
            FeatureUsage.feature_name,
            FeatureUsage.action,
            func.count(FeatureUsage.id).label('usage_count'),
            func.count(distinct(FeatureUsage.user_id)).label('unique_users'),
            func.avg(FeatureUsage.duration_seconds).label('avg_duration')
        ).filter(
            FeatureUsage.created_at >= start_date
        ).group_by(
            FeatureUsage.feature_name,
            FeatureUsage.action
        ).order_by(
            func.count(FeatureUsage.id).desc()
        ).all()
        
        df = pd.DataFrame(feature_data, columns=[
            'feature_name', 'action', 'usage_count', 'unique_users', 'avg_duration'
        ])
        
        if not df.empty:
            df['avg_duration'] = df['avg_duration'].fillna(0)
            df['penetration_rate'] = df['unique_users'] / df['unique_users'].max()
        
        return df
    
    def get_top_features(self, limit: int = 10, days: int = 30) -> List[Dict]:
        """
        获取最常用功能 TOP N
        
        Args:
            limit: 返回数量
            days: 分析天数
            
        Returns:
            List of feature stats
        """
        df = self.get_feature_usage_frequency(days)
        
        if df.empty:
            return []
        
        # 按功能聚合
        feature_summary = df.groupby('feature_name').agg({
            'usage_count': 'sum',
            'unique_users': 'max',
            'avg_duration': 'mean'
        }).reset_index()
        
        feature_summary = feature_summary.sort_values('usage_count', ascending=False).head(limit)
        
        return feature_summary.to_dict('records')
    
    def get_user_segments(self) -> pd.DataFrame:
        """
        用户分群分析
        
        Returns:
            DataFrame with user segments
        """
        # 获取所有用户及其活跃数据
        user_data = self.session.query(
            User.user_id,
            User.created_at,
            User.platform,
            User.age_group,
            func.count(distinct(UserActivity.activity_date)).label('active_days'),
            func.sum(UserActivity.session_duration_minutes).label('total_duration'),
            func.count(distinct(SleepRecord.session_id)).label('sleep_sessions')
        ).outerjoin(
            UserActivity, User.user_id == UserActivity.user_id
        ).outerjoin(
            SleepRecord, User.user_id == SleepRecord.user_id
        ).group_by(
            User.user_id, User.created_at, User.platform, User.age_group
        ).all()
        
        df = pd.DataFrame(user_data, columns=[
            'user_id', 'signup_date', 'platform', 'age_group',
            'active_days', 'total_duration', 'sleep_sessions'
        ])
        
        # 用户分群
        df['user_type'] = pd.cut(
            df['active_days'],
            bins=[0, 3, 10, 20, float('inf')],
            labels=['流失用户', '低频用户', '中频用户', '高频用户']
        )
        
        df['engagement_level'] = pd.cut(
            df['total_duration'].fillna(0),
            bins=[0, 30, 120, 300, float('inf')],
            labels=['低活跃', '中活跃', '高活跃', '超级活跃']
        )
        
        return df
    
    def generate_report(self, days: int = 30) -> Dict:
        """
        生成用户行为分析报告
        
        Args:
            days: 分析天数
            
        Returns:
            Complete report dict
        """
        return {
            "summary": {
                "dau": self.get_dau(),
                "mau": self.get_mau(),
                "dau_mau_ratio": self.get_dau_mau_ratio(),
                "analysis_period_days": days
            },
            "trend": self.get_active_users_trend(days).to_dict('records') if not self.get_active_users_trend(days).empty else [],
            "retention": self.get_user_retention(),
            "session_duration": self.get_session_duration_distribution(days),
            "top_features": self.get_top_features(10, days),
            "user_segments": self.get_user_segments().to_dict('records') if not self.get_user_segments().empty else []
        }


def main():
    """主函数 - 演示用法"""
    with get_db_session() as session:
        analytics = UserBehaviorAnalytics(session)
        
        print("=" * 60)
        print("用户行为分析报告")
        print("=" * 60)
        
        print(f"\n📊 日活跃用户 (DAU): {analytics.get_dau()}")
        print(f"📊 月活跃用户 (MAU): {analytics.get_mau()}")
        print(f"📊 DAU/MAU 比率：{analytics.get_dau_mau_ratio():.2%}")
        
        print("\n📈 用户留存率:")
        retention = analytics.get_user_retention()
        for days, rate in retention.items():
            print(f"   {days}日留存：{rate:.2%}")
        
        print("\n⏱️  使用时长分布:")
        duration = analytics.get_session_duration_distribution()
        print(f"   平均时长：{duration.get('mean', 0):.1f} 分钟")
        print(f"   中位数：{duration.get('median', 0):.1f} 分钟")
        
        print("\n🔥 热门功能:")
        for feature in analytics.get_top_features(5):
            print(f"   {feature['feature_name']}: {feature['usage_count']} 次")
        
        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
