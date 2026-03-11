"""
睡了么数据分析系统 - 配置文件
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# 项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent

# 数据库配置
DATABASE_CONFIG = {
    "type": os.getenv("DB_TYPE", "sqlite"),  # sqlite 或 postgresql
    "sqlite": {
        "url": f"sqlite:///{BASE_DIR}/data/slemei.db"
    },
    "postgresql": {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", 5432)),
        "database": os.getenv("DB_NAME", "slemei_analytics"),
        "user": os.getenv("DB_USER", "admin"),
        "password": os.getenv("DB_PASSWORD", ""),
    }
}

# 分析配置
ANALYTICS_CONFIG = {
    # 留存分析天数
    "retention_days": [1, 7, 30],
    # 活跃用户定义（多少天内登录算活跃）
    "active_days": 1,
    # 睡眠时长阈值（小时）
    "sleep_duration_min": 3,
    "sleep_duration_max": 12,
    # 质量评分阈值
    "quality_threshold": {
        "excellent": 80,
        "good": 60,
        "fair": 40,
        "poor": 0
    }
}

# 可视化配置
VISUALIZATION_CONFIG = {
    "chart_width": 1200,
    "chart_height": 600,
    "dpi": 150,
    "theme": "seaborn-v0_8",
    "colors": {
        "primary": "#4A90E2",
        "secondary": "#50E3C2",
        "accent": "#F5A623",
        "danger": "#E74C3C",
        "success": "#2ECC71"
    }
}

# 埋点配置
TRACKING_CONFIG = {
    "enabled": os.getenv("TRACKING_ENABLED", "true").lower() == "true",
    "batch_size": 100,
    "flush_interval": 30,  # 秒
    "events": [
        "app_open",
        "app_close",
        "sleep_start",
        "sleep_end",
        "quality_rate",
        "report_view",
        "feature_use",
        "setting_change",
        "export_data"
    ]
}

# A/B 测试配置
AB_TESTING_CONFIG = {
    "enabled": True,
    "default_variant": "control",
    "min_sample_size": 1000,
    "significance_level": 0.05
}

# API 配置
API_CONFIG = {
    "host": os.getenv("API_HOST", "0.0.0.0"),
    "port": int(os.getenv("API_PORT", 8000)),
    "debug": os.getenv("API_DEBUG", "false").lower() == "true",
    "cors_origins": ["*"]
}

# 导出配置
EXPORT_CONFIG = {
    "formats": ["csv", "excel", "pdf", "json"],
    "max_rows": 100000,
    "compression": "gzip"
}

# 日志配置
LOGGING_CONFIG = {
    "level": os.getenv("LOG_LEVEL", "INFO"),
    "format": "{time:YYYY-MM-DD HH:mm:ss} | {level} | {module} | {message}",
    "rotation": "10 MB",
    "retention": "30 days"
}
