# 睡了么 App - 灰度发布配置交付总结

## 📦 交付内容

本次为"睡了么"App 配置的灰度发布系统包含以下文件和脚本：

### 文档

| 文件 | 说明 |
|------|------|
| `README.md` | 完整配置文档，包含策略、分组、版本控制、监控、回滚等详细说明 |
| `QUICKSTART.md` | 快速入门指南，包含常用命令和流程说明 |
| `SUMMARY.md` | 本文件 - 交付总结 |

### 配置文件

| 文件 | 说明 |
|------|------|
| `config/release-config.yaml` | 主配置文件，定义发布策略、用户分组、监控阈值、回滚条件等 |
| `config/grafana-dashboard.json` | Grafana 监控面板配置，可直接导入使用 |

### 执行脚本

| 脚本 | 说明 | 大小 |
|------|------|------|
| `scripts/deploy.sh` | 部署脚本，管理灰度发布各阶段 | 11KB |
| `scripts/rollback.sh` | 回滚脚本，支持自动/手动回滚 | 11KB |
| `scripts/monitor.sh` | 监控脚本，采集指标、检查阈值、生成报告 | 11KB |

---

## ✅ 需求覆盖

### 1. 灰度发布策略 ✓

- [x] **5% → 20% → 50% → 100%** 四阶段发布
  - 配置位置：`config/release-config.yaml` → `release_strategy.phases`
  - 执行命令：`./scripts/deploy.sh start <version>` 和 `./scripts/deploy.sh promote`

- [x] **每阶段观察 2-3 天**
  - 配置位置：`config/release-config.yaml` → `release_strategy.phases.*.observation_days`
  - 检查清单：`QUICKSTART.md` 中的阶段推进检查清单

- [x] **快速回滚机制**
  - 回滚脚本：`scripts/rollback.sh`
  - 回滚时间目标：< 30 分钟

### 2. 灰度发布配置 ✓

- [x] **用户分组策略**
  - 配置位置：`config/release-config.yaml` → `user_segmentation`
  - 分组类型：内部测试组、灰度组、对照组、普通用户
  - 定向规则：新用户、高活跃用户、VIP 用户保护

- [x] **版本控制**
  - 配置位置：`config/release-config.yaml` → `version_control`
  - 版本规范：SemVer + 阶段后缀
  - 版本存储：S3 配置

- [x] **监控指标配置**
  - 配置位置：`config/release-config.yaml` → `monitoring`
  - 核心指标：崩溃率、ANR 率、启动失败率、API 错误率
  - 告警配置：钉钉/Slack 通知、升级流程
  - Grafana 面板：`config/grafana-dashboard.json`

### 3. 回滚机制 ✓

- [x] **崩溃率 > 1% 自动回滚**
  - 配置位置：`config/release-config.yaml` → `rollback.auto_rollback`
  - 执行命令：`./scripts/rollback.sh --auto`

- [x] **严重 Bug 手动回滚**
  - 执行命令：`./scripts/rollback.sh --reason "原因"`
  - 审批流程：Release Manager + Engineering Lead

- [x] **回滚时间 < 30 分钟**
  - 时间预算配置：
    - 决策：< 5 分钟
    - 执行：< 15 分钟
    - 验证：< 10 分钟
  - 回滚脚本内置时间追踪和告警

---

## 🚀 使用流程

### 开始发布

```bash
cd gray-release

# 1. 开始灰度发布 (5%)
./scripts/deploy.sh start 2.1.0

# 2. 查看状态
./scripts/deploy.sh status

# 3. 启动监控
./scripts/monitor.sh watch &
```

### 推进阶段

```bash
# 观察 2-3 天后，检查指标
./scripts/monitor.sh check

# 指标合格，推进到下一阶段
./scripts/deploy.sh promote

# 重复直到 100%
```

### 紧急回滚

```bash
# 自动回滚 (崩溃率 > 1%)
./scripts/rollback.sh --auto

# 或手动回滚
./scripts/rollback.sh --reason "发现严重 Bug"
```

---

## 📊 监控指标阈值

| 指标 | Phase 1 (5%) | Phase 2 (20%) | Phase 3+ (50-100%) |
|------|-------------|--------------|-------------------|
| 崩溃率 | < 0.5% | < 0.8% | < 1.0% |
| ANR 率 | < 0.3% | < 0.5% | < 0.8% |
| 启动失败率 | < 0.5% | < 0.8% | < 1.0% |
| API 错误率 | < 1.0% | < 2.0% | < 3.0% |

---

## 🔧 集成说明

### 需要配置的环境变量

```bash
# 发布管理 API
export RELEASE_API_ENDPOINT="https://release.sleepwell.internal/api/v1"
export RELEASE_API_TOKEN="your-token"

# 监控系统
export GRAFANA_API_KEY="your-grafana-key"

# 告警通知
export DINGTALK_RELEASE_ALERTS_WEBHOOK="your-webhook"

# 错误追踪
export SENTRY_DSN="your-sentry-dsn"
```

### API 集成点

脚本中的 API 调用目前为模拟实现，实际使用时需要替换为真实 API：

1. **发布管理 API** (`deploy.sh`):
   - `update_traffic_config()` - 更新流量分配
   - `push_config_to_edge()` - 推送边缘配置

2. **监控系统 API** (`monitor.sh`):
   - `get_crash_rate()` - 获取崩溃率
   - `get_anr_rate()` - 获取 ANR 率
   - 其他指标采集函数

3. **告警系统** (`monitor.sh`, `rollback.sh`):
   - `send_alert()` - 发送告警
   - `send_release_notification()` - 发布通知

---

## 📁 目录结构

```
gray-release/
├── README.md                 # 完整配置文档
├── QUICKSTART.md             # 快速入门
├── SUMMARY.md                # 交付总结 (本文件)
├── config/
│   ├── release-config.yaml   # 主配置文件
│   └── grafana-dashboard.json # Grafana 面板
├── scripts/
│   ├── deploy.sh             # 部署脚本
│   ├── rollback.sh           # 回滚脚本
│   └── monitor.sh            # 监控脚本
├── logs/                     # 日志目录 (运行时生成)
└── state/                    # 状态文件 (运行时生成)
```

---

## ⚠️ 注意事项

1. **API 集成**: 脚本中的 API 调用为模拟实现，需替换为实际系统 API
2. **权限配置**: 确保脚本有执行权限 (`chmod +x scripts/*.sh`)
3. **环境变量**: 使用前配置必要的环境变量
4. **日志监控**: 定期检查 `logs/` 目录下的日志文件
5. **状态管理**: `state/` 目录存储当前发布状态，不要手动修改

---

## 📞 后续支持

如有问题或需要调整配置，请参考：

- 详细文档：`README.md`
- 快速指南：`QUICKSTART.md`
- 脚本帮助：`./scripts/<script>.sh help`

---

*交付日期：2026-03-07*
*交付团队：DevOps*
