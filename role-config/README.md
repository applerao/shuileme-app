# 🎭 角色配置中心

**用途：** 每个角色的独立配置文件，记录角色偏好、经验和成长

---

## 目录结构

```
role-config/
├── README.md                    # 本文件
├── engineering/                 # 工程类角色
│   ├── backend-architect.md     # 后端架构师
│   └── senior-developer.md      # 高级开发者
├── testing/                     # 测试类角色
│   └── test-results-analyzer.md # 测试结果分析师
├── marketing/                   # 市场类角色
├── product/                     # 产品类角色
└── design/                      # 设计类角色
```

---

## 角色配置文件结构

每个角色的 `.md` 文件包含：

| 章节 | 内容 |
|------|------|
| **核心职责** | 角色的主要工作范围 |
| **工作偏好** | 技术栈、工具、方法论偏好 |
| **历史经验** | 参与过的任务和学到的经验 |
| **协作关系** | 常合作的其他角色 |
| **成长目标** | 短期/中期/长期目标 |
| **变更记录** | 配置更新历史 |

---

## 已配置角色（18 个）

### Engineering (工程类) - 5/7 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Backend Architect` | [backend-architect.md](./engineering/backend-architect.md) | 2026-03-12 | SQLite 兼容性架构设计 |
| `Senior Developer` | [senior-developer.md](./engineering/senior-developer.md) | 2026-03-12 | PostgreSQL→SQLite 代码修复 |
| `Frontend Developer` | [frontend-developer.md](./engineering/frontend-developer.md) | 待激活 | - |
| `DevOps Automator` | [devops-automator.md](./engineering/devops-automator.md) | 待激活 | - |
| `AI Engineer` | [ai-engineer.md](./engineering/ai-engineer.md) | 待激活 | - |

### Testing (测试类) - 1/7 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Test Results Analyzer` | [test-results-analyzer.md](./testing/test-results-analyzer.md) | 2026-03-12 | SQLite 兼容性全面排查 |

### Product (产品类) - 1/3 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Product Manager` | [product-manager.md](./product/product-manager.md) | 待激活 | - |

### Design (设计类) - 1/7 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `UI Designer` | [ui-designer.md](./design/ui-designer.md) | 待激活 | - |

### Marketing (市场类) - 2/8 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Content Creator` | [content-creator.md](./marketing/content-creator.md) | 待激活 | - |
| `Growth Hacker` | [growth-hacker.md](./marketing/growth-hacker.md) | 待激活 | - |

### Strategy (战略类) - 1/3 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Data Analyst` | [data-analyst.md](./strategy/data-analyst.md) | 待激活 | - |

### Support (支持类) - 3/6 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Support Responder` | [support-responder.md](./support/support-responder.md) | 待激活 | - |
| `Analytics Reporter` | [analytics-reporter.md](./support/analytics-reporter.md) | 待激活 | - |
| `Infrastructure Maintainer` | [infrastructure-maintainer.md](./support/infrastructure-maintainer.md) | 待激活 | - |

### Spatial Computing (空间计算类) - 1/6 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `XR Interface Architect` | [xr-interface-architect.md](./spatial-computing/xr-interface-architect.md) | 待激活 | - |

### Specialized (专业类) - 3/7 个 ✅

| 角色 | 配置文件 | 首次激活 | 最近任务 |
|------|---------|---------|---------|
| `Agents Orchestrator` | [agents-orchestrator.md](./specialized/agents-orchestrator.md) | 待激活 | - |
| `Data Consolidation Agent` | [data-consolidation-agent.md](./specialized/data-consolidation-agent.md) | 待激活 | - |
| `Domain Expert` | [domain-expert.md](./specialized/domain-expert.md) | 待激活 | - |

---

## 使用方式

### 激活角色
```bash
# 查看角色配置
cat role-config/engineering/backend-architect.md

# 激活角色（通过对话）
"让 Backend Architect 设计数据库方案"
```

### 更新角色经验
任务完成后，更新对应角色的"历史经验"章节：
1. 记录任务内容
2. 学到的经验教训
3. 产出文档/代码
4. 技术债务清单

### 角色成长追踪
每个角色有短期/中期/长期目标，定期回顾进展。

---

## 角色协作流程

```
1. 万能小秘书接收任务
   ↓
2. 分析需要的角色
   ↓
3. 依次激活角色（读取角色配置）
   ↓
4. 角色按配置偏好工作
   ↓
5. 输出专业交付物
   ↓
6. 更新角色经验（记录本次任务）
   ↓
7. 万能小秘书汇总交付
```

---

## 维护规范

### 何时更新角色配置
- ✅ 完成新类型任务后
- ✅ 学到新经验教训后
- ✅ 技术栈偏好变化后
- ✅ 角色目标调整后

### 更新频率
- **历史经验** - 每次任务后
- **成长目标** - 每月审查
- **工作偏好** - 按需更新

### 版本控制
角色配置文件纳入 Git 版本控制，变更有提交记录。

---

## 关联文件

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | 工作区通用规约（含角色策略） |
| `USER.md` | 用户信息和偏好 |
| `ROLE-CONSTRAINTS.md` | 角色扮演规约 |
| `role-library/` | 77 个角色的原始定义 |

---

**创建日期：** 2026-03-12  
**维护者：** 万能小秘书  
**下次审查：** 2026-03-19
