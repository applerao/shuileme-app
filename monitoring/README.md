# 睡了么 App 性能监控系统

## 技术栈

| 组件 | 用途 | 版本 |
|------|------|------|
| Prometheus | 指标采集与存储 | v2.45.0 |
| Grafana | 可视化 Dashboard | v10.0.0 |
| Alertmanager | 告警管理 | v0.26.0 |
| Elasticsearch | 日志存储 | 8.11.0 |
| Logstash | 日志处理 | 8.11.0 |
| Filebeat | 日志采集 | 8.11.0 |
| Node Exporter | 服务器指标 | v1.6.0 |
| MySQL Exporter | 数据库指标 | v0.14.0 |
| Blackbox Exporter | API 探测 | v0.24.0 |

## 目录结构

```
monitoring/
├── README.md                 # 本文档
├── docker-compose.yml        # 一键部署脚本
├── prometheus/
│   ├── prometheus.yml        # Prometheus 配置
│   ├── rules/
│   │   ├── api-alerts.yml    # API 告警规则
│   │   ├── system-alerts.yml # 系统告警规则
│   │   └── app-alerts.yml    # 应用告警规则
│   └── targets/
│       └── static-config.yml # 静态目标配置
├── grafana/
│   ├── provisioning/
│   │   ├── datasources.yml   # 数据源配置
│   │   └── dashboards.yml    # Dashboard 配置
│   └── dashboards/
│       ├── api-performance.json
│       ├── system-monitor.json
│       ├── app-crash.json
│       └── log-analysis.json
├── alertmanager/
│   ├── alertmanager.yml      # 告警路由配置
│   └── templates/
│       └── dingtalk.tmpl     # 钉钉告警模板
├── elasticsearch/
│   └── elasticsearch.yml     # ES 配置
├── logstash/
│   ├── logstash.yml          # Logstash 配置
│   └── pipeline/
│       └── app-logs.conf     # 日志处理规则
├── filebeat/
│   └── filebeat.yml          # Filebeat 配置
├── scripts/
│   ├── deploy.sh             # 部署脚本
│   ├── backup.sh             # 备份脚本
│   └── health-check.sh       # 健康检查脚本
└── docs/
    ├── alert-rules.md        # 告警规则详解
    ├── oncall-schedule.md    # 值班安排
    └── troubleshooting.md    # 故障排查手册
```

## 快速开始

```bash
# 1. 克隆配置
cd monitoring

# 2. 一键部署
./scripts/deploy.sh

# 3. 访问 Dashboard
# Grafana: http://localhost:3000 (admin/admin123)
# Prometheus: http://localhost:9090
# Kibana: http://localhost:5601
```

## 监控指标概览

### 应用性能指标

| 指标名称 | 描述 | 告警阈值 |
|----------|------|----------|
| api_response_time | API 响应时间 | P95 > 500ms |
| api_error_rate | API 错误率 | > 1% |
| api_qps | 每秒请求数 | 异常波动 > 50% |
| db_query_time | 数据库查询时间 | P95 > 100ms |
| db_connection_pool | 连接池使用率 | > 80% |

### 系统资源指标

| 指标名称 | 描述 | 告警阈值 |
|----------|------|----------|
| node_cpu_usage | CPU 使用率 | > 80% |
| node_memory_usage | 内存使用率 | > 85% |
| node_disk_usage | 磁盘使用率 | > 90% |
| node_network_in | 网络流入 | 异常峰值 |
| node_network_out | 网络流出 | 异常峰值 |

### 用户体验指标

| 指标名称 | 描述 | 告警阈值 |
|----------|------|----------|
| app_crash_rate | App 崩溃率 | > 0.5% |
| app_startup_time | 启动时间 | P95 > 3s |
| page_load_time | 页面加载时间 | P95 > 2s |
| network_success_rate | 网络请求成功率 | < 99% |

## 告警级别定义

| 级别 | 响应时间 | 通知渠道 | 示例场景 |
|------|----------|----------|----------|
| P0 | 5 分钟内 | 电话 + 短信 + 钉钉 | 核心服务不可用、数据丢失 |
| P1 | 30 分钟内 | 短信 + 钉钉 | API 错误率飙升、数据库异常 |
| P2 | 2 小时内 | 钉钉 | 资源使用率偏高、非核心功能异常 |

## 值班安排

详见 [docs/oncall-schedule.md](docs/oncall-schedule.md)
