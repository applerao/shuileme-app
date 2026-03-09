# 角色临时工作空间配置

**创建时间：** 2026-03-06  
**位置：** `/home/admin/.openclaw/workspace-secretary/role-workspaces/`

---

## 🎯 设计目标

**问题：** 角色扮演产生的 memory 会污染主工作空间

**解决：** 创建独立的 `role-workspaces/`，每个角色一个独立的英文子目录

---

## 📁 目录结构

```
/home/admin/.openclaw/workspace-secretary/role-workspaces/
├── design/                        # 设计类角色（7 个）
├── engineering/                   # 工程类角色（7 个）
│   └── backend-developer/         # 示例：后端开发
│       ├── role-config.md
│       ├── memory/
│       │   └── 2026-03-06.md
│       ├── tasks/
│       └── outputs/
├── marketing/                     # 市场类角色（8 个）
├── product/                       # 产品类角色（3 个）
├── project-management/            # 项目管理类角色（5 个）
├── strategy/                      # 战略类角色（3 个）
├── support/                       # 支持类角色（6 个）
├── specialized/                   # 专业类角色（7 个）
└── spatial-computing/             # 空间计算类角色（6 个）
```

**总计：** 9 个分类，77 个角色位置（对应 role-library）

---

## 🎭 使用流程

### 1. 大圣爸爸下达角色扮演指令

```
"扮演 Backend Developer"
```

### 2. 万能小秘书自动创建角色目录

```bash
# 自动创建角色工作空间
mkdir -p /home/admin/.openclaw/workspace-secretary/role-workspaces/<category>/<role-name>/{memory,tasks,outputs}
```

**创建结果：**
```
✅ /home/admin/.openclaw/workspace-secretary/role-workspaces/engineering/backend-developer/
   ├── role-config.md
   ├── memory/2026-03-06.md
   ├── tasks/
   └── outputs/
```

### 3. 角色扮演中的记录

- **对话记录：** `memory/YYYY-MM-DD.md`
- **任务记录：** `tasks/`
- **输出成果：** `outputs/`

### 4. 角色扮演结束

- ✅ 重要成果 → 移动到主工作空间或项目目录
- ❌ 临时数据 → 可选择删除
- 📁 角色目录 → 保留（下次可复用）

---

## 🛠️ 管理命令

### 创建角色工作空间

```bash
# 用法
mkdir -p /home/admin/.openclaw/workspace-secretary/role-workspaces/<category>/<role-name>/{memory,tasks,outputs}

# 示例
mkdir -p /home/admin/.openclaw/workspace-secretary/role-workspaces/engineering/backend-developer/{memory,tasks,outputs}
mkdir -p /home/admin/.openclaw/workspace-secretary/role-workspaces/product/product-manager/{memory,tasks,outputs}
mkdir -p /home/admin/.openclaw/workspace-secretary/role-workspaces/design/ux-designer/{memory,tasks,outputs}
```

### 查看角色目录

```bash
# 查看所有分类
ls /home/admin/.openclaw/workspace-secretary/role-workspaces/

# 查看特定分类的角色
ls /home/admin/.openclaw/workspace-secretary/role-workspaces/engineering/

# 查看角色详情
ls -la /home/admin/.openclaw/workspace-secretary/role-workspaces/engineering/backend-developer/
```

### 清理临时数据

```bash
# 清理特定角色的 memory
rm -rf /home/admin/.openclaw/workspace-secretary/role-workspaces/engineering/backend-developer/memory/*

# 清理 7 天前的所有临时文件
find /home/admin/.openclaw/workspace-secretary/role-workspaces -type f -mtime +7 -delete

# 删除整个角色目录（谨慎！）
rm -rf /home/admin/.openclaw/workspace-secretary/role-workspaces/engineering/backend-developer/
```

---

## 📊 与主工作空间的隔离

### 主工作空间（workspace-secretary）
- ✅ 万能小秘书的永久记忆
- ✅ 重要文档和配置
- ✅ 长期记忆（MEMORY.md）
- ✅ 项目文档
- ❌ **不受角色扮演临时数据影响**

### 角色工作空间（role-workspaces）
- ✅ 角色扮演的临时记忆
- ✅ 角色任务的工作记录
- ✅ 可清理的临时数据
- ✅ **完全隔离，不影响主空间**

---

## 🎯 角色分类和命名

### 分类列表（9 个）

| 分类 | 角色数 | 示例 |
|------|--------|------|
| **design** | 7 | ui-designer, ux-designer |
| **engineering** | 7 | backend-developer, frontend-developer |
| **marketing** | 8 | growth-marketer, content-marketer |
| **product** | 3 | product-manager, product-owner |
| **project-management** | 5 | project-manager, scrum-master |
| **strategy** | 3 | strategy-consultant, business-analyst |
| **support** | 6 | customer-support, technical-writer |
| **specialized** | 7 | legal-counsel, risk-manager |
| **spatial-computing** | 6 | ar-developer, vr-developer |

### 命名规则

- **语言：** 英文（小写）
- **格式：** kebab-case（短横线分隔）
- **示例：** `backend-developer`、`product-manager`

---

## ✅ 优势总结

| 特性 | 之前 | 现在 |
|------|------|------|
| **记忆隔离** | ❌ 混在主空间 | ✅ 独立目录 |
| **清理方便** | ❌ 难以区分 | ✅ 按角色清理 |
| **成果管理** | ❌ 容易丢失 | ✅ 有序保存 |
| **性能影响** | ❌ 可能爆炸 | ✅ 隔离安全 |
| **角色切换** | ❌ 麻烦 | ✅ 快速切换 |

---

## 📝 示例场景

### 场景 1：扮演 Backend Developer

```
大圣爸爸："扮演 Backend Developer，设计一个打卡 API"

万能小秘书：
1. 创建目录：role-workspaces/engineering/backend-developer/
2. 加载角色设定（从 role-library/engineering/backend-developer.md）
3. 工作记录保存到 backend-developer/memory/
4. API 设计保存到 backend-developer/outputs/
5. 完成后询问是否保留成果
```

### 场景 2：扮演 Product Manager

```
大圣爸爸："用 Product Manager 的视角分析这个功能"

万能小秘书：
1. 创建目录：role-workspaces/product/product-manager/
2. 加载角色设定
3. 分析记录保存到 product-manager/memory/
4. 分析报告保存到 product-manager/outputs/
```

### 场景 3：清理临时数据

```
大圣爸爸："清理一下角色扮演的临时数据"

万能小秘书：
1. 保留重要成果（已移动到主空间）
2. 清理 7 天前的 memory 文件
3. 清理临时 tasks
4. 报告清理结果
```

---

## 🔧 配置文件

### role-config.md 模板

```markdown
# 角色配置

**角色：** [role-name]  
**分类：** [category]  
**创建时间：** [timestamp]  
**状态：** 活跃/已完成

---

## 会话记录

[自动记录每次会话]

## 任务列表

- [ ] 任务 1
- [ ] 任务 2

## 输出成果

- [成果 1](outputs/xxx.md)
- [成果 2](outputs/xxx.png)
```

---

## 📋 当前角色工作空间状态

| 分类 | 角色目录 | 状态 |
|------|---------|------|
| engineering | backend-developer | ✅ 已有数据 |
| 其他分类 | - | ⏳ 按需创建 |

---

**维护者：** 万能小秘书  
**创建时间：** 2026-03-06  
**版本：** v2.0（整合到 workspace-secretary）  
**最后更新：** 2026-03-09
