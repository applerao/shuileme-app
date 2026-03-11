"""
睡了么数据分析系统 - 睡眠数据分析模块

功能：
- 平均入睡时间统计
- 平均睡眠时长分布
- 睡眠质量评分趋势
- 用户睡眠改善报告
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, time
from typing import Dict, List, Optional, Tuple
from sqlalchemy import func, distinct, extract
from sqlalchemy.orm import Session
import sys
import os

sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.models import SleepRecord, User
from database.connection import get_db_session
from config.config import ANALYTICS_CONFIG


class SleepAnalytics:
    """睡眠数据分析类"""
    
    def __init__(self, session: Session):
        self.session = session
        self.config = ANALYTICS_CONFIG
    
    def get_average_bedtime(self, days: int = 30) -> Dict[str, any]:
        """
        获取平均入睡时间统计
        
        Args:
            days: 分析天数
            
        Returns:
            Dict with bedtime statistics
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 获取入睡时间数据
        sleep_data = self.session.query(
            SleepRecord.入睡时间，
            SleepRecord.start_time,
            SleepRecord.user_id
        ).filter(
            SleepRecord.start_time >= start_date,
            SleepRecord.入睡时间 != None
        ).all()
        
        if not sleep_data:
            return {"count": 0}
        
        # 转换为分钟数（从午夜开始）
        bedtimes_minutes = []
        for record in sleep_data:
            if record[0]:  # 入睡时间
                bedtime = record[0]
                minutes = bedtime.hour * 60 + bedtime.minute
                bedtimes_minutes.append(minutes)
        
        if not bedtimes_minutes:
            return {"count": 0}
        
        bedtimes_minutes = np.array(bedtimes_minutes)
        
        # 处理跨午夜情况（如果大部分人在午夜后睡觉）
        median_minutes = np.median(bedtimes_minutes)
        if median_minutes > 23 * 60:  # 如果中位数在 23 点后
            # 将凌晨 0-4 点的时间加上 24 小时
            bedtimes_minutes = np.where(bedtimes_minutes < 8 * 60, 
                                        bedtimes_minutes + 24 * 60, 
                                        bedtimes_minutes)
        
        avg_minutes = np.mean(bedtimes_minutes)
        
        # 转换回时间格式
        avg_hour = int(avg_minutes // 60) % 24
        avg_minute = int(avg_minutes % 60)
        
        return {
            "count": len(bedtimes_minutes),
            "average_time": f"{avg_hour:02d}:{avg_minute:02d}",
            "average_minutes": float(avg_minutes),
            "median_minutes": float(np.median(bedtimes_minutes)),
            "std_minutes": float(np.std(bedtimes_minutes)),
            "earliest": f"{int(np.min(bedtimes_minutes) // 60):02d}:{int(np.min(bedtimes_minutes) % 60):02d}",
            "latest": f"{int(np.max(bedtimes_minutes) // 60):02d}:{int(np.max(bedtimes_minutes) % 60):02d}"
        }
    
    def get_sleep_duration_distribution(self, days: int = 30) -> Dict[str, any]:
        """
        获取平均睡眠时长分布
        
        Args:
            days: 分析天数
            
        Returns:
            Dict with duration distribution
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 获取睡眠时长数据
        duration_data = self.session.query(
            SleepRecord.duration_minutes,
            SleepRecord.user_id
        ).filter(
            SleepRecord.start_time >= start_date,
            SleepRecord.duration_minutes >= self.config["sleep_duration_min"] * 60,
            SleepRecord.duration_minutes <= self.config["sleep_duration_max"] * 60
        ).all()
        
        durations = [d[0] for d in duration_data]
        
        if not durations:
            return {"count": 0}
        
        durations = np.array(durations)
        durations_hours = durations / 60
        
        # 定义时间段
        bins = [0, 5, 6, 7, 8, 9, 10, float('inf')]
        labels = ['<5 小时', '5-6 小时', '6-7 小时', '7-8 小时', '8-9 小时', '9-10 小时', '>10 小时']
        
        distribution = pd.cut(durations_hours, bins=bins, labels=labels, right=False)
        distribution_counts = distribution.value_counts().to_dict()
        
        # 按质量分类
        quality_dist = {
            "不足 (＜6 小时)": len([d for d in durations_hours if d < 6]),
            "正常 (6-8 小时)": len([d for d in durations_hours if 6 <= d <= 8]),
            "过长 (＞8 小时)": len([d for d in durations_hours if d > 8])
        }
        
        return {
            "count": len(durations),
            "mean_hours": float(np.mean(durations_hours)),
            "median_hours": float(np.median(durations_hours)),
            "std_hours": float(np.std(durations_hours)),
            "min_hours": float(np.min(durations_hours)),
            "max_hours": float(np.max(durations_hours)),
            "distribution": {str(k): v for k, v in distribution_counts.items()},
            "quality_distribution": quality_dist,
            "percentiles": {
                "p25": float(np.percentile(durations_hours, 25)),
                "p50": float(np.percentile(durations_hours, 50)),
                "p75": float(np.percentile(durations_hours, 75)),
                "p90": float(np.percentile(durations_hours, 90))
            }
        }
    
    def get_quality_score_trend(self, days: int = 30) -> pd.DataFrame:
        """
        获取睡眠质量评分趋势
        
        Args:
            days: 分析天数
            
        Returns:
            DataFrame with daily quality scores
        """
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # 按日期聚合质量评分
        quality_data = self.session.query(
            func.date(SleepRecord.start_time).label('sleep_date'),
            func.avg(SleepRecord.quality_score).label('avg_quality'),
            func.count(SleepRecord.id).label('session_count')
        ).filter(
            func.date(SleepRecord.start_time) >= start_date,
            SleepRecord.quality_score != None
        ).group_by(
            func.date(SleepRecord.start_time)
        ).order_by(
            func.date(SleepRecord.start_time)
        ).all()
        
        df = pd.DataFrame(quality_data, columns=['date', 'avg_quality', 'session_count'])
        
        if not df.empty:
            df['date'] = pd.to_datetime(df['date'])
            # 计算移动平均（7 天）
            df['quality_7d_ma'] = df['avg_quality'].rolling(window=7, min_periods=1).mean()
            # 计算趋势
            if len(df) >= 7:
                df['trend'] = df['avg_quality'].diff()
        
        return df
    
    def get_quality_distribution(self, days: int = 30) -> Dict[str, any]:
        """
        获取睡眠质量评分分布
        
        Args:
            days: 分析天数
            
        Returns:
            Dict with quality distribution
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        quality_data = self.session.query(
            SleepRecord.quality_score
        ).filter(
            SleepRecord.start_time >= start_date,
            SleepRecord.quality_score != None
        ).all()
        
        scores = [q[0] for q in quality_data]
        
        if not scores:
            return {"count": 0}
        
        scores = np.array(scores)
        
        # 按等级分类
        thresholds = self.config["quality_threshold"]
        distribution = {
            "优秀": len([s for s in scores if s >= thresholds["excellent"]]),
            "良好": len([s for s in scores if thresholds["good"] <= s < thresholds["excellent"]]),
            "一般": len([s for s in scores if thresholds["fair"] <= s < thresholds["good"]]),
            "较差": len([s for s in scores if s < thresholds["fair"]])
        }
        
        return {
            "count": len(scores),
            "mean": float(np.mean(scores)),
            "median": float(np.median(scores)),
            "std": float(np.std(scores)),
            "distribution": distribution,
            "excellent_rate": distribution["优秀"] / len(scores),
            "good_rate": (distribution["优秀"] + distribution["良好"]) / len(scores)
        }
    
    def get_sleep_structure_analysis(self, days: int = 30) -> Dict[str, any]:
        """
        睡眠结构分析（深睡/浅睡/REM）
        
        Args:
            days: 分析天数
            
        Returns:
            Dict with sleep structure stats
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        structure_data = self.session.query(
            SleepRecord.deep_sleep_minutes,
            SleepRecord.light_sleep_minutes,
            SleepRecord.rem_sleep_minutes,
            SleepRecord.duration_minutes
        ).filter(
            SleepRecord.start_time >= start_date,
            SleepRecord.deep_sleep_minutes != None
        ).all()
        
        if not structure_data:
            return {"count": 0}
        
        deep_sleep = [d[0] for d in structure_data if d[0]]
        light_sleep = [d[1] for d in structure_data if d[1]]
        rem_sleep = [d[2] for d in structure_data if d[2]]
        total_duration = [d[3] for d in structure_data if d[3]]
        
        # 计算各阶段占比
        deep_ratio = np.mean(deep_sleep) / np.mean(total_duration) if total_duration else 0
        light_ratio = np.mean(light_sleep) / np.mean(total_duration) if total_duration else 0
        rem_ratio = np.mean(rem_sleep) / np.mean(total_duration) if total_duration else 0
        
        return {
            "count": len(structure_data),
            "deep_sleep": {
                "avg_minutes": float(np.mean(deep_sleep)) if deep_sleep else 0,
                "ratio": float(deep_ratio),
                "recommended_ratio": "15-25%"
            },
            "light_sleep": {
                "avg_minutes": float(np.mean(light_sleep)) if light_sleep else 0,
                "ratio": float(light_ratio),
                "recommended_ratio": "50-60%"
            },
            "rem_sleep": {
                "avg_minutes": float(np.mean(rem_sleep)) if rem_sleep else 0,
                "ratio": float(rem_ratio),
                "recommended_ratio": "20-25%"
            },
            "awake_times": {
                "avg": float(np.mean([d[4] for d in structure_data if d[4]])) if structure_data else 0
            }
        }
    
    def get_user_sleep_improvement(self, user_id: str, days: int = 30) -> Dict[str, any]:
        """
        用户睡眠改善报告
        
        Args:
            user_id: 用户 ID
            days: 分析天数
            
        Returns:
            Dict with improvement report
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        mid_date = start_date + (end_date - start_date) / 2
        
        # 前半段数据
        first_half = self.session.query(
            func.avg(SleepRecord.duration_minutes).label('avg_duration'),
            func.avg(SleepRecord.quality_score).label('avg_quality'),
            func.avg(SleepRecord.入睡时间).label('avg_bedtime')
        ).filter(
            SleepRecord.user_id == user_id,
            SleepRecord.start_time >= start_date,
            SleepRecord.start_time < mid_date
        ).first()
        
        # 后半段数据
        second_half = self.session.query(
            func.avg(SleepRecord.duration_minutes).label('avg_duration'),
            func.avg(SleepRecord.quality_score).label('avg_quality'),
            func.avg(SleepRecord.入睡时间).label('avg_bedtime')
        ).filter(
            SleepRecord.user_id == user_id,
            SleepRecord.start_time >= mid_date,
            SleepRecord.start_time <= end_date
        ).first()
        
        if not first_half or not second_half:
            return {"status": "insufficient_data"}
        
        # 计算改善情况
        duration_change = (second_half.avg_duration - first_half.avg_duration) if first_half.avg_duration and second_half.avg_duration else 0
        quality_change = (second_half.avg_quality - first_half.avg_quality) if first_half.avg_quality and second_half.avg_quality else 0
        
        # 判断改善趋势
        trends = []
        if duration_change > 10:
            trends.append("睡眠时长增加")
        elif duration_change < -10:
            trends.append("睡眠时长减少")
        
        if quality_change > 5:
            trends.append("睡眠质量提升")
        elif quality_change < -5:
            trends.append("睡眠质量下降")
        
        return {
            "user_id": user_id,
            "period": {
                "first_half": {
                    "avg_duration_minutes": float(first_half.avg_duration) if first_half.avg_duration else None,
                    "avg_quality": float(first_half.avg_quality) if first_half.avg_quality else None
                },
                "second_half": {
                    "avg_duration_minutes": float(second_half.avg_duration) if second_half.avg_duration else None,
                    "avg_quality": float(second_half.avg_quality) if second_half.avg_quality else None
                }
            },
            "changes": {
                "duration_change_minutes": float(duration_change) if duration_change else 0,
                "quality_change": float(quality_change) if quality_change else 0
            },
            "trends": trends,
            "overall_improvement": quality_change > 0 or duration_change > 10
        }
    
    def get_weekly_pattern(self, days: int = 60) -> pd.DataFrame:
        """
        获取每周睡眠模式（工作日 vs 周末）
        
        Args:
            days: 分析天数
            
        Returns:
            DataFrame with weekly patterns
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 获取带星期几的睡眠数据
        pattern_data = self.session.query(
            extract('dow', SleepRecord.start_time).label('day_of_week'),  # 0=Sunday
            func.avg(SleepRecord.duration_minutes).label('avg_duration'),
            func.avg(SleepRecord.quality_score).label('avg_quality'),
            func.avg(extract('hour', SleepRecord.入睡时间) * 60 + extract('minute', SleepRecord.入睡时间)).label('avg_bedtime_minutes'),
            func.count(SleepRecord.id).label('count')
        ).filter(
            SleepRecord.start_time >= start_date
        ).group_by(
            extract('dow', SleepRecord.start_time)
        ).all()
        
        df = pd.DataFrame(pattern_data, columns=['day_of_week', 'avg_duration', 'avg_quality', 'avg_bedtime_minutes', 'count'])
        
        # 转换星期几
        day_names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        df['day_name'] = df['day_of_week'].apply(lambda x: day_names[int(x)])
        
        # 标记工作日/周末
        df['is_weekend'] = df['day_of_week'].isin([0, 6])
        
        return df
    
    def get_sleep_correlation_analysis(self, days: int = 60) -> Dict[str, float]:
        """
        睡眠相关性分析
        
        Args:
            days: 分析天数
            
        Returns:
            Dict with correlation coefficients
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 获取完整数据
        corr_data = self.session.query(
            SleepRecord.duration_minutes,
            SleepRecord.quality_score,
            SleepRecord.deep_sleep_minutes,
            SleepRecord.awake_times
        ).filter(
            SleepRecord.start_time >= start_date,
            SleepRecord.quality_score != None,
            SleepRecord.deep_sleep_minutes != None
        ).all()
        
        if len(corr_data) < 10:
            return {}
        
        df = pd.DataFrame(corr_data, columns=['duration', 'quality', 'deep_sleep', 'awake_times'])
        df = df.dropna()
        
        if df.empty:
            return {}
        
        # 计算相关系数
        correlations = {
            "duration_quality": float(df['duration'].corr(df['quality'])),
            "deep_sleep_quality": float(df['deep_sleep'].corr(df['quality'])),
            "awake_times_quality": float(df['awake_times'].corr(df['quality'])),
            "deep_sleep_duration": float(df['deep_sleep'].corr(df['duration']))
        }
        
        return correlations
    
    def generate_report(self, days: int = 30) -> Dict:
        """
        生成睡眠数据分析报告
        
        Args:
            days: 分析天数
            
        Returns:
            Complete report dict
        """
        return {
            "summary": {
                "avg_bedtime": self.get_average_bedtime(days),
                "duration_distribution": self.get_sleep_duration_distribution(days),
                "quality_distribution": self.get_quality_distribution(days)
            },
            "trend": self.get_quality_score_trend(days).to_dict('records') if not self.get_quality_score_trend(days).empty else [],
            "structure": self.get_sleep_structure_analysis(days),
            "weekly_pattern": self.get_weekly_pattern(days).to_dict('records') if not self.get_weekly_pattern(days).empty else [],
            "correlations": self.get_sleep_correlation_analysis(days)
        }


def main():
    """主函数 - 演示用法"""
    with get_db_session() as session:
        analytics = SleepAnalytics(session)
        
        print("=" * 60)
        print("睡眠数据分析报告")
        print("=" * 60)
        
        print("\n😴 平均入睡时间:")
        bedtime = analytics.get_average_bedtime()
        print(f"   平均时间：{bedtime.get('average_time', 'N/A')}")
        
        print("\n⏱️  睡眠时长分布:")
        duration = analytics.get_sleep_duration_distribution()
        print(f"   平均时长：{duration.get('mean_hours', 0):.1f} 小时")
        print(f"   中位数：{duration.get('median_hours', 0):.1f} 小时")
        
        print("\n⭐ 睡眠质量分布:")
        quality = analytics.get_quality_distribution()
        for level, count in quality.get('distribution', {}).items():
            print(f"   {level}: {count} 次")
        
        print("\n📊 睡眠结构:")
        structure = analytics.get_sleep_structure_analysis()
        if 'deep_sleep' in structure:
            print(f"   深睡占比：{structure['deep_sleep']['ratio']:.1%} (推荐：15-25%)")
            print(f"   浅睡占比：{structure['light_sleep']['ratio']:.1%} (推荐：50-60%)")
            print(f"   REM 占比：{structure['rem_sleep']['ratio']:.1%} (推荐：20-25%)")
        
        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
