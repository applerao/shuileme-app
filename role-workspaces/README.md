# 角色数据隔离机制 - 使用指南

**状态：** ✅ 已激活  
**位置：** `role-workspaces/`  
**版本：** v2.0

---

## 🎯 机制说明

角色扮演时，所有临时数据（记忆、任务记录、输出成果）都保存在独立的 `role-workspaces/` 目录中，与主工作空间完全隔离。

---

## 📁 目录结构

```
/home/admin/.openclaw/workspace-secretary/
├── role-library/              # 77 个角色定义（只读）
├── role-workspaces/           # 角色临时工作空间（可写）
│   ├── engineering/
│   │   └── backend-developer/
│   │       ├── role-config.md
│   │       ├── memory/
│   │       ├── tasks/
│   │       └── outputs/
│   └── ... (其他分类)
├── projects/                  # 正式项目
└── ... (其他主空间内容)
```

---

## 🎭 使用方法

### 自动激活

当你说"扮演 XXX"时，系统会自动：

1. **加载角色设定** - 从 `role-library/<category>/<role>.md`
2. **创建工作空间** - `role-workspaces/<category>/<role>/{memory,tasks,outputs}`
3. **隔离记录** - 所有临时数据保存在角色工作空间
4. **成果管理** - 重要成果可移动到主空间或项目目录

### 示例

```
大圣爸爸："扮演 Backend Developer，设计一个打卡 API"

万能小秘书：
1. ✅ 加载角色：role-library/engineering/backend-developer.md
2. ✅ 创建工作空间：role-workspaces/engineering/backend-developer/
3. ✅ 隔离记录：所有对话和临时数据保存在角色目录
4. ✅ 成果管理：API 设计可移动到 projects/slept-well/
```

---

## 🛠️ 管理命令

### 查看角色工作空间

```bash
# 查看所有角色目录
ls /home/admin/.openclaw/workspace-secretary/role-workspaces/

# 查看特定分类
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
```

---

## 📊 当前状态

| 分类 | 角色目录 | 文件数 | 状态 |
|------|---------|--------|------|
| engineering | backend-developer | 2 | ✅ 活跃 |
| 其他分类 | - | 0 | ⏳ 按需创建 |

---

## ✅ 优势

| 特性 | 无隔离 | 有隔离 |
|------|--------|--------|
| **主空间清洁** | ❌ 被角色记忆污染 | ✅ 保持清洁 |
| **清理方便** | ❌ 难以区分 | ✅ 按角色清理 |
| **角色切换** | ❌ 需要清理 | ✅ 直接切换 |
| **成果管理** | ❌ 容易混淆 | ✅ 清晰分离 |

---

## 🔄 工作流程

```
角色扮演开始
    ↓
加载角色设定 (role-library/)
    ↓
创建工作空间 (role-workspaces/<category>/<role>/)
    ↓
角色扮演中 (数据隔离保存)
    ↓
角色扮演结束
    ↓
询问是否保留成果
    ├─→ 重要成果 → 移动到 projects/ 或主空间
    └─→ 临时数据 → 可选择清理
```

---

**最后更新：** 2026-03-09  
**维护者：** 万能小秘书
