# 睡了么 App - 灰度发布配置文档

## 📋 概述

本文档定义了"睡了么"App 的灰度发布策略、配置和回滚机制。

---

## 1. 灰度发布策略

### 1.1 发布阶段

| 阶段 | 流量比例 | 观察期 | 通过标准 |
|------|----------|--------|----------|
| Phase 1 | 5% | 2-3 天 | 崩溃率 < 0.5%, 无 P0/P1 Bug |
| Phase 2 | 20% | 2-3 天 | 崩溃率 < 0.8%, 无 P0/P1 Bug |
| Phase 3 | 50% | 2-3 天 | 崩溃率 < 1.0%, 无 P0/P1 Bug |
| Phase 4 | 100% | 持续监控 | 崩溃率 < 1.0% |

### 1.2 发布流程图

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Phase 1   │───▶│   Phase 2   │───▶│   Phase 3   │───▶│   Phase 4   │
│    5%       │    │    20%      │    │    50%      │    │   100%      │
│  观察 2-3 天  │    │  观察 2-3 天  │    │  观察 2-3 天  │    │  全量发布   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
   自动检查           自动检查           自动检查           完成
   崩溃率<0.5%        崩溃率<0.8%        崩溃率<1.0%
```

---

## 2. 用户分组策略

### 2.1 分组规则

```yaml
# 用户分组配置文件
user_groups:
  # 内部测试组 (始终优先)
  internal:
    type: user_id_list
    users:
      - employee_001
      - employee_002
      - beta_testers
  
  # 灰度组 (按阶段动态调整)
  canary:
    type: percentage
    seed: "user_id"  # 基于用户 ID 哈希
    percentage: 5    # 动态更新：5 → 20 → 50 → 100
  
  # 对照组 (始终使用稳定版)
  control:
    type: percentage
    seed: "user_id"
    percentage: 0    # 保留部分用户不参与灰度
```

### 2.2 分组优先级

1. **内部测试组** - 优先发布，用于冒烟测试
2. **灰度组** - 按百分比逐步扩大
3. **对照组** - 保留 5-10% 用户作为基准对比

### 2.3 用户特征维度

```yaml
targeting_rules:
  - name: "新用户"
    condition: "user.registered_at > now() - 7d"
    priority: 1
  
  - name: "高活跃用户"
    condition: "user.weekly_sessions >= 10"
    priority: 2
  
  - name: "特定地区"
    condition: "user.region in ['北京', '上海', '广州']"
    priority: 3
  
  - name: "设备类型"
    condition: "user.device_os == 'iOS' or 'Android'"
    priority: 4
```

---

## 3. 版本控制

### 3.1 版本号规范

```
主版本。次版本。修订版本-灰度阶段
例如：2.1.0-phase1, 2.1.0-phase2, 2.1.0-release
```

### 3.2 版本元数据

```json
{
  "version": "2.1.0",
  "build_number": 2100,
  "phase": "phase1",
  "release_date": "2026-03-07",
  "features": [
    "sleep_tracking_v2",
    "smart_alarm_beta"
  ],
  "min_ios_version": "14.0",
  "min_android_version": "8.0"
}
```

### 3.3 版本存储

```
/releases
  /2.1.0
    /phase1
      - ios_ipa_url
      - android_apk_url
      - release_notes.md
      - checksum.sha256
    /phase2
    /phase3
    /release
```

---

## 4. 监控指标配置

### 4.1 核心监控指标

| 指标 | 阈值 (Phase 1) | 阈值 (Phase 2) | 阈值 (Phase 3+) | 告警级别 |
|------|---------------|---------------|----------------|----------|
| 崩溃率 | > 0.5% | > 0.8% | > 1.0% | P0 |
| ANR 率 | > 0.3% | > 0.5% | > 0.8% | P1 |
| 启动失败率 | > 0.5% | > 0.8% | > 1.0% | P0 |
| API 错误率 | > 1.0% | > 2.0% | > 3.0% | P1 |
| 用户投诉率 | > 0.1% | > 0.2% | > 0.5% | P2 |

### 4.2 监控面板配置

```yaml
dashboards:
  gray_release:
    panels:
      - name: "崩溃率趋势"
        metric: "app.crash_rate"
        group_by: "version, phase"
        time_range: "24h"
      
      - name: "版本分布"
        metric: "app.active_users"
        group_by: "version"
        chart: "pie"
      
      - name: "关键错误 Top10"
        metric: "app.error_count"
        group_by: "error_type, version"
        limit: 10
      
      - name: "性能指标"
        metrics:
          - "app.launch_time.p95"
          - "app.api_latency.p95"
          - "app.memory_usage.avg"
```

### 4.3 告警规则

```yaml
alerts:
  - name: "崩溃率超标"
    condition: "crash_rate > threshold"
    threshold_by_phase:
      phase1: 0.005
      phase2: 0.008
      phase3: 0.010
    action: "auto_rollback"
    notify: ["#release-alerts", "oncall"]
  
  - name: "严重 Bug 报告"
    condition: "bug_severity == 'P0' or bug_severity == 'P1'"
    action: "manual_review"
    notify: ["#release-alerts", "product-team", "engineering"]
  
  - name: "用户投诉激增"
    condition: "complaint_rate > 0.005"
    action: "notify"
    notify: ["#customer-support", "product-team"]
```

---

## 5. 回滚机制

### 5.1 自动回滚条件

```yaml
auto_rollback:
  enabled: true
  conditions:
    - metric: "crash_rate"
      operator: ">"
      threshold: 0.01  # 1%
      window: "1h"
    
    - metric: "launch_failure_rate"
      operator: ">"
      threshold: 0.02  # 2%
      window: "30m"
    
    - metric: "api_error_rate"
      operator: ">"
      threshold: 0.10  # 10%
      window: "15m"
  
  actions:
    - "stop_deployment"
    - "rollback_to_previous"
    - "notify_team"
    - "create_incident"
```

### 5.2 手动回滚流程

```
1. 发现严重 Bug
   ↓
2. 在 #release-alerts 频道报告
   ↓
3. Release Manager 确认回滚
   ↓
4. 执行回滚脚本 (./rollback.sh)
   ↓
5. 验证回滚完成 (< 30 分钟)
   ↓
6. 事后复盘 (Post-mortem)
```

### 5.3 回滚时间目标

| 操作 | 目标时间 | 负责人 |
|------|----------|--------|
| 决策回滚 | < 5 分钟 | Release Manager |
| 执行回滚 | < 15 分钟 | DevOps |
| 验证完成 | < 10 分钟 | QA |
| **总计** | **< 30 分钟** | - |

### 5.4 回滚版本策略

```yaml
rollback_target:
  default: "previous_stable"
  options:
    - "immediate_previous"  # 上一版本
    - "last_known_good"    # 最后已知稳定版
    - "specific_version"    # 指定版本 (手动)
  
  validation:
    - "health_check_passed"
    - "smoke_tests_passed"
    - "no_active_incidents"
```

---

## 6. 发布检查清单

### 6.1 发布前检查 (Pre-release)

- [ ] 代码审查完成
- [ ] 自动化测试通过率 100%
- [ ] 性能测试通过
- [ ] 安全扫描无高危漏洞
- [ ] 回滚脚本已验证
- [ ] 监控告警已配置
- [ ] On-call 人员已安排
- [ ] 发布通知已发送

### 6.2 阶段推进检查 (Phase Promotion)

- [ ] 当前阶段观察期已满 (2-3 天)
- [ ] 崩溃率低于阈值
- [ ] 无 P0/P1 级别 Bug
- [ ] 用户反馈正常
- [ ] 性能指标正常
- [ ] 团队确认可以推进

### 6.3 发布后检查 (Post-release)

- [ ] 全量用户已更新
- [ ] 监控指标稳定
- [ ] 用户反馈收集
- [ ] 发布总结文档
- [ ] 经验教训归档

---

## 7. 联系人

| 角色 | 人员 | 联系方式 |
|------|------|----------|
| Release Manager | TBD | @release-manager |
| DevOps On-call | TBD | #devops-oncall |
| Product Owner | TBD | @product-owner |
| Engineering Lead | TBD | @eng-lead |

---

## 8. 附录

### 8.1 相关文档

- [发布流程 SOP](./SOP-release.md)
- [回滚操作手册](./SOP-rollback.md)
- [监控指标定义](./metrics-definition.md)
- [事故响应流程](./incident-response.md)

### 8.2 工具链接

- 发布管理系统：https://release.sleepwell.internal
- 监控面板：https://grafana.sleepwell.internal
- 告警中心：https://alerts.sleepwell.internal
- 用户反馈：https://feedback.sleepwell.internal

---

*文档版本：1.0*
*最后更新：2026-03-07*
*维护团队：DevOps*
