"""
睡了么数据分析系统 - 转化漏斗分析模块

功能：
- 定义转化漏斗
- 计算转化率
- 漏斗可视化
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
import sys
import os

sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.models import TrackingEvent, User, SleepRecord
from database.connection import get_db_session
from tracking.events import PredefinedEvents


class FunnelAnalytics:
    """转化漏斗分析类"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_signup_funnel(self, days: int = 30) -> Dict:
        """
        注册转化漏斗
        
        流程：访问 App -> 开始注册 -> 完成注册 -> 首次记录睡眠
        
        Args:
            days: 分析天数
            
        Returns:
            Funnel data
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 1. 打开 App 的用户
        app_opens = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.APP_OPEN,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 2. 开始注册的用户
        signup_starts = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.SIGNUP_START,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 3. 完成注册的用户
        signup_completes = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.SIGNUP_COMPLETE,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 4. 完成首次睡眠记录的用户
        first_sleep_users = self.session.query(
            func.count(distinct(SleepRecord.user_id))
        ).filter(
            SleepRecord.start_time >= start_date
        ).scalar() or 0
        
        funnel = {
            "steps": [
                {"name": "打开 App", "count": app_opens, "rate": 1.0},
                {"name": "开始注册", "count": signup_starts, "rate": signup_starts / app_opens if app_opens > 0 else 0},
                {"name": "完成注册", "count": signup_completes, "rate": signup_completes / app_opens if app_opens > 0 else 0},
                {"name": "首次睡眠记录", "count": first_sleep_users, "rate": first_sleep_users / app_opens if app_opens > 0 else 0}
            ],
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "days": days
            }
        }
        
        # 计算步骤间转化率
        for i in range(1, len(funnel["steps"])):
            prev_count = funnel["steps"][i-1]["count"]
            curr_count = funnel["steps"][i]["count"]
            funnel["steps"][i]["step_rate"] = curr_count / prev_count if prev_count > 0 else 0
        
        return funnel
    
    def get_payment_funnel(self, days: int = 30) -> Dict:
        """
        付费转化漏斗
        
        流程：查看会员页 -> 开始支付 -> 完成支付
        
        Args:
            days: 分析天数
            
        Returns:
            Funnel data
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 查看会员页
        view_premium = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == "view_premium",
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 开始支付
        payment_starts = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.PAYMENT_START,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 完成支付
        payment_completes = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.PAYMENT_COMPLETE,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        funnel = {
            "steps": [
                {"name": "查看会员页", "count": view_premium, "rate": 1.0},
                {"name": "开始支付", "count": payment_starts, "rate": payment_starts / view_premium if view_premium > 0 else 0},
                {"name": "完成支付", "count": payment_completes, "rate": payment_completes / view_premium if view_premium > 0 else 0}
            ],
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "days": days
            }
        }
        
        # 计算步骤间转化率
        for i in range(1, len(funnel["steps"])):
            prev_count = funnel["steps"][i-1]["count"]
            curr_count = funnel["steps"][i]["count"]
            funnel["steps"][i]["step_rate"] = curr_count / prev_count if prev_count > 0 else 0
        
        return funnel
    
    def get_sleep_recording_funnel(self, days: int = 30) -> Dict:
        """
        睡眠记录转化漏斗
        
        流程：打开睡眠页 -> 开始记录 -> 完成记录 -> 评分
        
        Args:
            days: 分析天数
            
        Returns:
            Funnel data
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 打开睡眠页
        view_sleep = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == "view_sleep_page",
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 开始记录
        sleep_starts = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.SLEEP_START,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 完成记录
        sleep_ends = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.SLEEP_END,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        # 评分
        quality_rates = self.session.query(
            func.count(distinct(TrackingEvent.user_id))
        ).filter(
            TrackingEvent.event_name == PredefinedEvents.QUALITY_RATE,
            TrackingEvent.created_at >= start_date
        ).scalar() or 0
        
        funnel = {
            "steps": [
                {"name": "打开睡眠页", "count": view_sleep, "rate": 1.0},
                {"name": "开始记录", "count": sleep_starts, "rate": sleep_starts / view_sleep if view_sleep > 0 else 0},
                {"name": "完成记录", "count": sleep_ends, "rate": sleep_ends / view_sleep if view_sleep > 0 else 0},
                {"name": "质量评分", "count": quality_rates, "rate": quality_rates / view_sleep if view_sleep > 0 else 0}
            ],
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "days": days
            }
        }
        
        # 计算步骤间转化率
        for i in range(1, len(funnel["steps"])):
            prev_count = funnel["steps"][i-1]["count"]
            curr_count = funnel["steps"][i]["count"]
            funnel["steps"][i]["step_rate"] = curr_count / prev_count if prev_count > 0 else 0
        
        return funnel
    
    def compare_funnels(self, funnel_a: Dict, funnel_b: Dict) -> Dict:
        """
        比较两个漏斗（用于 A/B 测试）
        
        Args:
            funnel_a: 对照组漏斗
            funnel_b: 实验组漏斗
            
        Returns:
            Comparison data
        """
        comparison = {
            "steps": [],
            "analysis": []
        }
        
        for i, (step_a, step_b) in enumerate(zip(funnel_a["steps"], funnel_b["steps"])):
            rate_a = step_a["rate"]
            rate_b = step_b["rate"]
            
            # 计算相对提升
            if rate_a > 0:
                relative_lift = (rate_b - rate_a) / rate_a
            else:
                relative_lift = 0
            
            comparison["steps"].append({
                "name": step_a["name"],
                "variant_a_rate": rate_a,
                "variant_b_rate": rate_b,
                "absolute_diff": rate_b - rate_a,
                "relative_lift": relative_lift
            })
            
            # 判断是否显著提升（简化版，实际应该用统计检验）
            if abs(relative_lift) > 0.1:  # 10% 阈值
                comparison["analysis"].append({
                    "step": step_a["name"],
                    "winner": "B" if relative_lift > 0 else "A",
                    "lift": f"{relative_lift:.1%}"
                })
        
        return comparison
    
    def get_funnel_dropoff_analysis(self, funnel: Dict) -> Dict:
        """
        漏斗流失分析
        
        Args:
            funnel: 漏斗数据
            
        Returns:
            Dropoff analysis
        """
        dropoffs = []
        
        for i in range(1, len(funnel["steps"])):
            prev_step = funnel["steps"][i-1]
            curr_step = funnel["steps"][i]
            
            dropoff_count = prev_step["count"] - curr_step["count"]
            dropoff_rate = 1 - curr_step["step_rate"]
            
            dropoffs.append({
                "from_step": prev_step["name"],
                "to_step": curr_step["name"],
                "dropoff_count": dropoff_count,
                "dropoff_rate": dropoff_rate,
                "severity": "高" if dropoff_rate > 0.5 else "中" if dropoff_rate > 0.3 else "低"
            })
        
        # 找出最大流失点
        if dropoffs:
            max_dropoff = max(dropoffs, key=lambda x: x["dropoff_rate"])
        else:
            max_dropoff = None
        
        return {
            "dropoffs": dropoffs,
            "biggest_dropoff": max_dropoff,
            "recommendations": self._generate_recommendations(dropoffs)
        }
    
    def _generate_recommendations(self, dropoffs: List[Dict]) -> List[str]:
        """根据流失情况生成优化建议"""
        recommendations = []
        
        for dropoff in dropoffs:
            if dropoff["severity"] == "高":
                step_name = dropoff["from_step"]
                if "注册" in step_name:
                    recommendations.append(f"优化{step_name}流程，减少必填项，提供第三方登录")
                elif "支付" in step_name:
                    recommendations.append(f"简化{step_name}流程，提供多种支付方式，增加信任背书")
                elif "记录" in step_name:
                    recommendations.append(f"优化{step_name}体验，提供快捷操作，减少等待时间")
                else:
                    recommendations.append(f"重点优化{step_name}到{dropoff['to_step']}的转化流程")
        
        return recommendations


def main():
    """主函数 - 演示用法"""
    with get_db_session() as session:
        funnel = FunnelAnalytics(session)
        
        print("=" * 60)
        print("转化漏斗分析")
        print("=" * 60)
        
        print("\n📊 注册转化漏斗:")
        signup_funnel = funnel.get_signup_funnel()
        for step in signup_funnel["steps"]:
            print(f"   {step['name']}: {step['count']} 人 ({step['rate']:.1%})")
        
        print("\n💰 付费转化漏斗:")
        payment_funnel = funnel.get_payment_funnel()
        for step in payment_funnel["steps"]:
            print(f"   {step['name']}: {step['count']} 人 ({step['rate']:.1%})")
        
        print("\n😴 睡眠记录漏斗:")
        sleep_funnel = funnel.get_sleep_recording_funnel()
        for step in sleep_funnel["steps"]:
            print(f"   {step['name']}: {step['count']} 人 ({step['rate']:.1%})")
        
        # 流失分析
        print("\n🔍 流失分析:")
        dropoff = funnel.get_funnel_dropoff_analysis(signup_funnel)
        if dropoff["biggest_dropoff"]:
            bd = dropoff["biggest_dropoff"]
            print(f"   最大流失：{bd['from_step']} → {bd['to_step']} ({bd['dropoff_rate']:.1%})")
        
        if dropoff["recommendations"]:
            print("\n💡 优化建议:")
            for rec in dropoff["recommendations"]:
                print(f"   • {rec}")
        
        print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
