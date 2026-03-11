# 睡了么 Analytics - 数据分析

Python 数据分析脚本，用于用户行为分析、睡眠数据分析、可视化报表。

## 技术栈

- **语言:** Python 3.9+
- **数据分析:** Pandas, NumPy
- **可视化:** Matplotlib, Plotly
- **数据库:** MySQL

## 模块说明

| 模块 | 说明 |
|------|------|
| `analytics/` | 分析脚本 |
| ├── `sleep_analysis.py` | 睡眠数据分析 |
| ├── `user_behavior.py` | 用户行为分析 |
| └── `funnel.py` | 转化漏斗分析 |
| `database/` | 数据库连接 |
| `visualization/` | 可视化报表 |

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 配置数据库连接
# 编辑 config/config.py

# 运行分析脚本
python analytics/sleep_analysis.py
```

## 分析报表

- 睡眠时长分布
- 用户留存率
- 打卡转化率
- 活跃时段分析

---

**数据源:** MySQL 生产库（只读）  
**输出:** CSV / PNG 报表
