"""
睡了么数据分析系统 - 数据可视化模块

功能：
- 数据后台图表优化
- 用户个人报告优化
- 数据导出功能 (CSV/Excel/PDF)
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import io
import base64
import sys
import os

sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config.config import VISUALIZATION_CONFIG, EXPORT_CONFIG


class DataVisualization:
    """数据可视化类"""
    
    def __init__(self):
        self.config = VISUALIZATION_CONFIG
        self._setup_style()
    
    def _setup_style(self):
        """设置可视化样式"""
        plt.style.use(self.config.get('theme', 'seaborn-v0_8'))
        plt.rcParams['figure.figsize'] = (self.config['chart_width'] / self.config['dpi'],
                                          self.config['chart_height'] / self.config['dpi'])
        plt.rcParams['figure.dpi'] = self.config['dpi']
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
        plt.rcParams['axes.unicode_minus'] = False
    
    def create_dau_mau_chart(self, data: pd.DataFrame, save_path: str = None) -> str:
        """
        创建 DAU/MAU 趋势图
        
        Args:
            data: DataFrame with columns: date, dau, mau
            save_path: 保存路径
            
        Returns:
            Base64 encoded image or file path
        """
        fig, ax1 = plt.subplots(figsize=(14, 7))
        
        # DAU 柱状图
        ax1.bar(data['date'], data['dau'], color=self.config['colors']['primary'], 
                label='DAU', alpha=0.7, width=0.8)
        ax1.set_xlabel('日期')
        ax1.set_ylabel('日活跃用户', color=self.config['colors']['primary'])
        ax1.tick_params(axis='y', labelcolor=self.config['colors']['primary'])
        
        # MAU 折线图（双 Y 轴）
        ax2 = ax1.twinx()
        ax2.plot(data['date'], data['mau'], color=self.config['colors']['secondary'], 
                 marker='o', linewidth=2, label='MAU')
        ax2.set_ylabel('月活跃用户', color=self.config['colors']['secondary'])
        ax2.tick_params(axis='y', labelcolor=self.config['colors']['secondary'])
        
        # DAU/MAU 比率
        if 'dau_mau_ratio' in data.columns:
            ax3 = ax1.twinx()
            ax3.spines['right'].set_position(('outward', 60))
            ax3.plot(data['date'], data['dau_mau_ratio'] * 100, 
                    color=self.config['colors']['accent'], linestyle='--',
                    linewidth=2, label='粘性 (%)')
            ax3.set_ylabel('DAU/MAU 比率 (%)', color=self.config['colors']['accent'])
            ax3.tick_params(axis='y', labelcolor=self.config['colors']['accent'])
        
        plt.title('用户活跃度趋势', fontsize=16, fontweight='bold')
        fig.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config['dpi'], bbox_inches='tight')
            plt.close()
            return save_path
        
        # 返回 Base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=self.config['dpi'], bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    
    def create_retention_heatmap(self, data: pd.DataFrame, save_path: str = None) -> str:
        """
        创建留存率热力图
        
        Args:
            data: DataFrame with cohort dates as index, retention days as columns
            save_path: 保存路径
            
        Returns:
            Base64 encoded image or file path
        """
        plt.figure(figsize=(12, 8))
        
        # 创建热力图
        sns.heatmap(data, annot=True, fmt='.1%', cmap='YlGnBu', 
                   linewidths=0.5, cbar_kws={'label': '留存率'})
        
        plt.xlabel('注册后天数')
        plt.ylabel('注册日期')
        plt.title('用户留存矩阵', fontsize=16, fontweight='bold')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config['dpi'], bbox_inches='tight')
            plt.close()
            return save_path
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=self.config['dpi'], bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    
    def create_sleep_duration_distribution(self, data: Dict, save_path: str = None) -> str:
        """
        创建睡眠时长分布图
        
        Args:
            data: Dict with distribution data
            save_path: 保存路径
            
        Returns:
            Base64 encoded image or file path
        """
        fig, axes = plt.subplots(1, 2, figsize=(14, 6))
        
        # 左图：时长分布直方图
        if 'distribution' in data:
            categories = list(data['distribution'].keys())
            counts = list(data['distribution'].values())
            
            colors = plt.cm.Blues(np.linspace(0.4, 0.9, len(categories)))
            axes[0].bar(categories, counts, color=colors, edgecolor='white')
            axes[0].set_xlabel('睡眠时长')
            axes[0].set_ylabel('次数')
            axes[0].set_title('睡眠时长分布')
            axes[0].tick_params(axis='x', rotation=45)
        
        # 右图：质量分布饼图
        if 'quality_distribution' in data:
            categories = list(data['quality_distribution'].keys())
            counts = list(data['quality_distribution'].values())
            
            colors = [self.config['colors']['success'], 
                     self.config['colors']['primary'],
                     self.config['colors']['accent']]
            axes[1].pie(counts, labels=categories, autopct='%1.1f%%', colors=colors)
            axes[1].set_title('睡眠质量分布')
        
        plt.suptitle('睡眠时长与质量分析', fontsize=16, fontweight='bold')
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config['dpi'], bbox_inches='tight')
            plt.close()
            return save_path
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=self.config['dpi'], bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    
    def create_quality_trend_chart(self, data: pd.DataFrame, save_path: str = None) -> str:
        """
        创建睡眠质量趋势图
        
        Args:
            data: DataFrame with columns: date, avg_quality, quality_7d_ma
            save_path: 保存路径
            
        Returns:
            Base64 encoded image or file path
        """
        plt.figure(figsize=(14, 7))
        
        # 原始数据
        plt.plot(data['date'], data['avg_quality'], 
                color=self.config['colors']['primary'], 
                linewidth=1, alpha=0.5, label='日评分')
        
        # 移动平均
        if 'quality_7d_ma' in data.columns:
            plt.plot(data['date'], data['quality_7d_ma'],
                    color=self.config['colors']['secondary'],
                    linewidth=3, label='7 日移动平均')
        
        # 添加参考线
        thresholds = [40, 60, 80]
        labels = ['较差', '良好', '优秀']
        colors = [self.config['colors']['danger'], 
                 self.config['colors']['accent'],
                 self.config['colors']['success']]
        
        for threshold, label, color in zip(thresholds, labels, colors):
            plt.axhline(y=threshold, color=color, linestyle='--', 
                       alpha=0.5, label=f'{label} ({threshold})')
        
        plt.xlabel('日期')
        plt.ylabel('质量评分')
        plt.title('睡眠质量评分趋势', fontsize=16, fontweight='bold')
        plt.legend(loc='lower right')
        plt.ylim(0, 100)
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config['dpi'], bbox_inches='tight')
            plt.close()
            return save_path
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=self.config['dpi'], bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    
    def create_feature_usage_chart(self, data: pd.DataFrame, save_path: str = None) -> str:
        """
        创建功能使用频率图
        
        Args:
            data: DataFrame with feature usage data
            save_path: 保存路径
            
        Returns:
            Base64 encoded image or file path
        """
        plt.figure(figsize=(12, 8))
        
        # 取前 15 个功能
        top_features = data.head(15)
        
        colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(top_features)))
        
        plt.barh(top_features['feature_name'], top_features['usage_count'], color=colors)
        plt.xlabel('使用次数')
        plt.ylabel('功能名称')
        plt.title('功能使用频率 TOP 15', fontsize=16, fontweight='bold')
        plt.gca().invert_yaxis()
        
        # 添加数值标签
        for i, v in enumerate(top_features['usage_count']):
            plt.text(v + max(top_features['usage_count']) * 0.01, i, 
                    str(int(v)), va='center', fontsize=9)
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=self.config['dpi'], bbox_inches='tight')
            plt.close()
            return save_path
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=self.config['dpi'], bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    
    def create_personal_report(self, user_data: Dict, save_path: str = None) -> str:
        """
        创建用户个人睡眠报告
        
        Args:
            user_data: Dict with user sleep statistics
            save_path: 保存路径
            
        Returns:
            Base64 encoded image or file path
        """
        fig = plt.figure(figsize=(12, 16))
        
        # 标题
        fig.suptitle(f'睡眠报告 - {user_data.get("user_id", "用户")}', 
                    fontsize=20, fontweight='bold', y=0.98)
        
        # 1. 关键指标
        ax1 = plt.subplot2grid((4, 2), (0, 0), colspan=2)
        metrics = [
            f"平均时长：{user_data.get('avg_duration', 0):.1f}h",
            f"平均质量：{user_data.get('avg_quality', 0):.0f}分",
            f"平均入睡：{user_data.get('avg_bedtime', 'N/A')}",
            f"总记录：{user_data.get('total_records', 0)}次"
        ]
        ax1.axis('off')
        ax1.text(0.5, 0.5, '\n'.join(metrics), ha='center', va='center',
                fontsize=14, bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.3))
        
        # 2. 时长分布
        ax2 = plt.subplot2grid((4, 2), (1, 0))
        if 'duration_distribution' in user_data:
            dist = user_data['duration_distribution']
            ax2.pie(dist.values(), labels=dist.keys(), autopct='%1.1f%%')
            ax2.set_title('时长分布')
        
        # 3. 质量趋势
        ax3 = plt.subplot2grid((4, 2), (1, 1))
        if 'quality_trend' in user_data and user_data['quality_trend']:
            trend = pd.DataFrame(user_data['quality_trend'])
            ax3.plot(trend['date'], trend['avg_quality'], marker='o')
            ax3.set_title('质量趋势')
            ax3.tick_params(axis='x', rotation=45)
        
        # 4. 每周模式
        ax4 = plt.subplot2grid((4, 2), (2, 0), colspan=2)
        if 'weekly_pattern' in user_data:
            pattern = pd.DataFrame(user_data['weekly_pattern'])
            ax4.bar(pattern['day_name'], pattern['avg_duration'])
            ax4.set_title('每周睡眠时长')
            ax4.tick_params(axis='x', rotation=45)
        
        # 5. 改善建议
        ax5 = plt.subplot2grid((4, 2), (3, 0), colspan=2)
        ax5.axis('off')
        suggestions = user_data.get('suggestions', ['保持规律作息', '避免睡前使用电子设备'])
        ax5.text(0.5, 0.5, '💡 改善建议:\n' + '\n'.join([f"• {s}" for s in suggestions]),
                ha='center', va='center', fontsize=12,
                bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.3))
        
        plt.tight_layout(rect=[0, 0.02, 1, 0.96])
        
        if save_path:
            plt.savefig(save_path, dpi=self.config['dpi'], bbox_inches='tight')
            plt.close()
            return save_path
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=self.config['dpi'], bbox_inches='tight')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    
    def create_dashboard_summary(self, data: Dict) -> str:
        """
        创建数据后台摘要（HTML 格式）
        
        Args:
            data: Dict with all dashboard data
            
        Returns:
            HTML string
        """
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>睡了么 - 数据分析后台</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 1400px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }}
                .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                           gap: 20px; margin-bottom: 20px; }}
                .metric-card {{ background: white; padding: 20px; border-radius: 10px; 
                              box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }}
                .metric-value {{ font-size: 32px; font-weight: bold; color: #667eea; }}
                .metric-label {{ color: #666; margin-top: 5px; }}
                .chart-section {{ background: white; padding: 20px; border-radius: 10px; 
                                 margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .chart-title {{ font-size: 18px; font-weight: bold; margin-bottom: 15px; }}
                table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
                th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
                th {{ background: #f8f9fa; font-weight: 600; }}
                .trend-up {{ color: #2ECC71; }}
                .trend-down {{ color: #E74C3C; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🦞 睡了么 - 数据分析后台</h1>
                    <p>数据更新时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
                </div>
                
                <div class="metrics">
                    <div class="metric-card">
                        <div class="metric-value">{data.get('dau', 0):,}</div>
                        <div class="metric-label">日活跃用户 (DAU)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{data.get('mau', 0):,}</div>
                        <div class="metric-label">月活跃用户 (MAU)</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{data.get('dau_mau_ratio', 0):.1%}</div>
                        <div class="metric-label">用户粘性</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{data.get('avg_sleep_duration', 0):.1f}h</div>
                        <div class="metric-label">平均睡眠时长</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{data.get('avg_quality_score', 0):.0f}</div>
                        <div class="metric-label">平均质量评分</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{data.get('retention_d7', 0):.1%}</div>
                        <div class="metric-label">7 日留存率</div>
                    </div>
                </div>
                
                <div class="chart-section">
                    <div class="chart-title">📊 核心指标趋势</div>
                    <p>图表区域 - 可嵌入 Matplotlib/Plotly 生成的图表</p>
                </div>
                
                <div class="chart-section">
                    <div class="chart-title">🔥 热门功能</div>
                    <table>
                        <tr><th>功能名称</th><th>使用次数</th><th>用户渗透率</th></tr>
                        {self._generate_feature_rows(data.get('top_features', []))}
                    </table>
                </div>
            </div>
        </body>
        </html>
        """
        return html
    
    def _generate_feature_rows(self, features: List[Dict]) -> str:
        """生成功能表格行"""
        rows = ""
        for f in features[:10]:
            rows += f"""<tr>
                <td>{f.get('feature_name', 'N/A')}</td>
                <td>{f.get('usage_count', 0):,}</td>
                <td>{f.get('penetration_rate', 0):.1%}</td>
            </tr>"""
        return rows


class DataExporter:
    """数据导出类"""
    
    def __init__(self):
        self.config = EXPORT_CONFIG
        self.output_dir = Path("exports")
        self.output_dir.mkdir(exist_ok=True)
    
    def export_to_csv(self, data: pd.DataFrame, filename: str) -> str:
        """
        导出为 CSV
        
        Args:
            data: DataFrame to export
            filename: Output filename
            
        Returns:
            File path
        """
        filepath = self.output_dir / f"{filename}.csv"
        data.to_csv(filepath, index=False, encoding='utf-8-sig')
        return str(filepath)
    
    def export_to_excel(self, data: Dict[str, pd.DataFrame], filename: str) -> str:
        """
        导出为 Excel（多工作表）
        
        Args:
            data: Dict of {sheet_name: DataFrame}
            filename: Output filename
            
        Returns:
            File path
        """
        filepath = self.output_dir / f"{filename}.xlsx"
        
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            for sheet_name, df in data.items():
                df.to_excel(writer, sheet_name=sheet_name[:31], index=False)
        
        return str(filepath)
    
    def export_to_json(self, data: Dict, filename: str, indent: int = 2) -> str:
        """
        导出为 JSON
        
        Args:
            data: Dict to export
            filename: Output filename
            
        Returns:
            File path
        """
        import json
        
        filepath = self.output_dir / f"{filename}.json"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=indent, default=str)
        
        return str(filepath)
    
    def export_to_pdf(self, html_content: str, filename: str) -> str:
        """
        导出为 PDF（需要 reportlab 或 wkhtmltopdf）
        
        Args:
            html_content: HTML string
            filename: Output filename
            
        Returns:
            File path
        """
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors
        
        filepath = self.output_dir / f"{filename}.pdf"
        
        doc = SimpleDocTemplate(str(filepath), pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # 简单转换 HTML 为 PDF 内容
        story.append(Paragraph("睡了么数据分析报告", styles['Title']))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # 这里可以解析 HTML 内容添加更多元素
        story.append(Paragraph("详细数据请查看导出的 Excel 文件", styles['Normal']))
        
        doc.build(story)
        
        return str(filepath)
    
    def export_analytics_report(self, user_data: Dict, sleep_data: Dict, filename: str = None) -> Dict[str, str]:
        """
        导出完整分析报告
        
        Args:
            user_data: User behavior analytics data
            sleep_data: Sleep analytics data
            filename: Base filename
            
        Returns:
            Dict of exported file paths
        """
        if filename is None:
            filename = f"analytics_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        exported_files = {}
        
        # 导出 CSV
        if user_data.get('trend'):
            trend_df = pd.DataFrame(user_data['trend'])
            exported_files['trend_csv'] = self.export_to_csv(trend_df, f"{filename}_user_trend")
        
        # 导出 Excel
        excel_data = {}
        if user_data.get('top_features'):
            excel_data['功能使用'] = pd.DataFrame(user_data['top_features'])
        if sleep_data.get('summary'):
            excel_data['睡眠统计'] = pd.DataFrame([sleep_data['summary']])
        
        if excel_data:
            exported_files['excel'] = self.export_to_excel(excel_data, filename)
        
        # 导出 JSON
        full_report = {
            "generated_at": datetime.now().isoformat(),
            "user_behavior": user_data,
            "sleep_analysis": sleep_data
        }
        exported_files['json'] = self.export_to_json(full_report, filename)
        
        return exported_files


def main():
    """主函数 - 演示用法"""
    # 创建可视化实例
    viz = DataVisualization()
    exporter = DataExporter()
    
    print("=" * 60)
    print("数据可视化与导出演示")
    print("=" * 60)
    
    # 示例：导出测试数据
    test_data = pd.DataFrame({
        'date': pd.date_range('2024-01-01', periods=30),
        'dau': np.random.randint(100, 500, 30),
        'mau': np.random.randint(1000, 2000, 30)
    })
    test_data['dau_mau_ratio'] = test_data['dau'] / test_data['mau']
    
    # 导出 CSV
    csv_path = exporter.export_to_csv(test_data, "test_trend")
    print(f"\n✓ CSV 导出：{csv_path}")
    
    # 导出 Excel
    excel_data = {'趋势数据': test_data}
    excel_path = exporter.export_to_excel(excel_data, "test_report")
    print(f"✓ Excel 导出：{excel_path}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
