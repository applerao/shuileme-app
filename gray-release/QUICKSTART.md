# 睡了么 App - 灰度发布快速入门

## 📦 目录结构

```
gray-release/
├── README.md              # 完整配置文档
├── QUICKSTART.md          # 本文件 - 快速入门
├── config/
│   ├── release-config.yaml    # 发布配置
│   └── grafana-dashboard.json # 监控面板配置
├── scripts/
│   ├── deploy.sh          # 部署脚本
│   ├── rollback.sh        # 回滚脚本
│   └── monitor.sh         # 监控脚本
├── logs/                  # 日志目录 (自动生成)
└── state/                 # 状态文件 (自动生成)
```

## 🚀 快速开始

### 1. 准备工作

```bash
# 进入目录
cd gray-release

# 给脚本添加执行权限
chmod +x scripts/*.sh

# 检查环境
./scripts/deploy.sh status
```

### 2. 开始灰度发布

```bash
# 开始版本 2.1.0 的灰度发布 (从 5% 开始)
./scripts/deploy.sh start 2.1.0

# 查看当前状态
./scripts/deploy.sh status
```

### 3. 监控指标

```bash
# 检查当前指标是否达标
./scripts/monitor.sh check

# 采集一次指标
./scripts/monitor.sh collect

# 启动持续监控 (后台)
nohup ./scripts/monitor.sh watch > logs/monitor.log 2>&1 &
```

### 4. 推进发布阶段

观察 2-3 天后，如果指标正常：

```bash
# 推进到下一阶段 (5% → 20% → 50% → 100%)
./scripts/deploy.sh promote
```

### 5. 紧急回滚

```bash
# 手动回滚
./scripts/rollback.sh --reason "发现严重 Bug"

# 自动回滚 (崩溃率 > 1% 时)
./scripts/rollback.sh --auto
```

## 📊 发布流程

```
┌─────────────────────────────────────────────────────────────┐
│                    灰度发布流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 准备阶段                                                 │
│     - 代码审查 ✓                                             │
│     - 测试通过 ✓                                             │
│     - 配置检查 ✓                                             │
│                                                             │
│  2. Phase 1 (5%)                                            │
│     ./scripts/deploy.sh start 2.1.0                         │
│     ↓ 观察 2-3 天                                             │
│     ↓ 检查指标 ./scripts/monitor.sh check                   │
│                                                             │
│  3. Phase 2 (20%)                                           │
│     ./scripts/deploy.sh promote                             │
│     ↓ 观察 2-3 天                                             │
│                                                             │
│  4. Phase 3 (50%)                                           │
│     ./scripts/deploy.sh promote                             │
│     ↓ 观察 2-3 天                                             │
│                                                             │
│  5. Phase 4 (100%)                                          │
│     ./scripts/deploy.sh promote                             │
│     ↓ 全量发布完成                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ 回滚流程

```
发现严重问题
    ↓
评估影响 (P0/P1 Bug? 崩溃率 > 1%?)
    ↓
    ├─→ 自动回滚 (崩溃率 > 1%)
    │   ./scripts/rollback.sh --auto
    │
    └─→ 手动回滚
        ./scripts/rollback.sh --reason "原因"
        ↓
    回滚完成 (< 30 分钟)
        ↓
    事后复盘
```

## 📈 监控指标阈值

| 指标 | Phase 1 | Phase 2 | Phase 3+ | 告警级别 |
|------|---------|---------|----------|----------|
| 崩溃率 | < 0.5% | < 0.8% | < 1.0% | P0 |
| ANR 率 | < 0.3% | < 0.5% | < 0.8% | P1 |
| 启动失败率 | < 0.5% | < 0.8% | < 1.0% | P0 |
| API 错误率 | < 1.0% | < 2.0% | < 3.0% | P1 |

## 🔧 常用命令

```bash
# 查看帮助
./scripts/deploy.sh help
./scripts/rollback.sh help
./scripts/monitor.sh help

# 查看状态
./scripts/deploy.sh status

# 检查指标
./scripts/monitor.sh check

# 生成报告
./scripts/monitor.sh report 2026-03-07

# 中止发布
./scripts/deploy.sh abort
```

## 📝 检查清单

### 发布前
- [ ] 代码审查完成
- [ ] 自动化测试通过率 100%
- [ ] 回滚脚本已验证
- [ ] 监控告警已配置
- [ ] On-call 人员已安排

### 阶段推进前
- [ ] 观察期已满 (2-3 天)
- [ ] 崩溃率低于阈值
- [ ] 无 P0/P1 Bug
- [ ] 团队确认可以推进

### 发布后
- [ ] 监控指标稳定
- [ ] 用户反馈收集
- [ ] 发布总结文档

## 🆘 故障排查

### 问题：脚本执行失败
```bash
# 检查日志
tail -f logs/deploy-*.log
tail -f logs/rollback-*.log
```

### 问题：指标采集失败
```bash
# 手动测试指标采集
./scripts/monitor.sh collect

# 检查监控系统连接
curl https://grafana.sleepwell.internal/api/health
```

### 问题：回滚超时
```bash
# 检查回滚日志
tail -f logs/rollback-*.log

# 手动执行回滚步骤
./scripts/rollback.sh --force --reason "紧急回滚"
```

## 📞 联系人

| 角色 | 联系方式 |
|------|----------|
| Release Manager | @release-manager |
| DevOps On-call | #devops-oncall |
| 紧急电话 | TBD |

---

*详细文档请参阅 [README.md](./README.md)*
