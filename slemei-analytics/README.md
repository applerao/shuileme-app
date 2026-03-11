# 睡了么 (SleepWell) 数据分析系统优化方案

## 项目概述

本系统为"睡了么"睡眠追踪 App 提供完整的数据分析解决方案，包括用户行为分析、睡眠数据分析、可视化优化和数据埋点系统。

## 目录结构

```
slemei-analytics/
├── README.md                 # 项目说明
├── requirements.txt          # Python 依赖
├── config/
│   └── config.py            # 配置文件
├── database/
│   ├── models.py            # 数据模型
│   ├── schema.sql           # 数据库 schema
│   └── connection.py        # 数据库连接
├── analytics/
│   ├── user_behavior.py     # 用户行为分析
│   ├── sleep_analysis.py    # 睡眠数据分析
│   ├── retention.py         # 留存分析
│   └── funnel.py            # 漏斗分析
├── visualization/
│   ├── dashboard.py         # 数据后台图表
│   ├── personal_report.py   # 用户个人报告
│   └── export.py            # 数据导出
├── tracking/
│   ├── events.py            # 事件埋点定义
│   ├── ab_testing.py        # A/B 测试支持
│   └── collector.py         # 数据采集
├── api/
│   ├── routes.py            # API 路由
│   └── schemas.py           # API 数据模型
├── tests/
│   └── test_analytics.py    # 测试用例
└── scripts/
    ├── seed_data.py         # 测试数据生成
    └── migrate.py           # 数据库迁移
```

## 核心功能

### 1. 用户行为分析
- 日活/月活统计 (DAU/MAU)
- 用户留存分析（次日/7 日/30 日）
- 用户使用时长分布
- 功能使用频率分析

### 2. 睡眠数据分析
- 平均入睡时间统计
- 平均睡眠时长分布
- 睡眠质量评分趋势
- 用户睡眠改善报告

### 3. 数据可视化
- 数据后台图表优化
- 用户个人报告优化
- 数据导出功能 (CSV/Excel/PDF)

### 4. 数据埋点
- 关键事件埋点
- 转化漏斗分析
- A/B 测试支持

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 配置数据库
python scripts/migrate.py

# 生成测试数据
python scripts/seed_data.py

# 运行分析
python -m analytics.user_behavior
python -m analytics.sleep_analysis

# 启动 API 服务
python -m api.routes
```

## 技术栈

- **后端**: Python 3.10+
- **数据库**: PostgreSQL / SQLite
- **分析**: Pandas, NumPy
- **可视化**: Matplotlib, Plotly, Seaborn
- **API**: FastAPI
- **测试**: pytest

## 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)
