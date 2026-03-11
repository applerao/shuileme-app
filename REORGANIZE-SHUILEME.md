# 睡了么项目目录整理方案

## 当前问题

睡了么相关文件散落在 workspace-secretary 根目录：
- `shuileme-api/` - 后端 API
- `shuileme-app/` - 移动端 App
- `shuileme-admin-web/` - 管理后台
- `slept-app/` - 旧版 App（已废弃？）
- `sleep-checkin/` - 打卡组件
- `slemei-analytics/` - 数据分析
- `marketing-plan-slept-app.md` - 营销计划
- `slept-app-tech-spec.md` - 技术规格

## 整理方案

### 目标结构

```
projects/shuileme/
├── README.md              # 项目总览
├── api/                   # 后端 API (from shuileme-api)
├── app/                   # 移动端 App (from shuileme-app)
├── admin-web/             # 管理后台 (from shuileme-admin-web)
├── analytics/             # 数据分析 (from slemei-analytics)
├── docs/                  # 文档
│   ├── marketing-plan.md  # 营销计划
│   └── tech-spec.md       # 技术规格
└── legacy/                # 废弃代码
    ├── slept-app/         # 旧版 App
    └── sleep-checkin/     # 打卡组件
```

### 执行步骤

1. 创建 `projects/shuileme/` 目录结构
2. 移动相关文件到新位置
3. 更新 `.gitignore`
4. 创建项目 README
5. 提交整理后的代码

### 注意事项

- `slept-app/` 和 `sleep-checkin/` 标记为 legacy（已废弃）
- `shuileme-project-plan.md` 移动到 `docs/`
- 保持 Git 历史记录（使用 `git mv`）
