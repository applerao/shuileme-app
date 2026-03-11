# 睡了么 App - 项目总览

睡了么是一款睡眠健康管理应用，帮助用户建立健康的睡眠习惯。

## 📁 项目结构

```
shuileme/
├── api/                   # 后端 API（NestJS + TypeScript）
│   ├── src/
│   │   ├── auth/         # 认证模块
│   │   ├── users/        # 用户模块
│   │   ├── sleep-records/# 睡眠记录
│   │   ├── checkins/     # 打卡功能
│   │   ├── supervisions/ # 监督功能
│   │   └── push/         # 推送通知
│   ├── docs/             # API 文档
│   └── README.md
├── app/                   # 移动端 App（React Native）
│   ├── src/
│   │   ├── screens/      # 页面
│   │   ├── components/   # 组件
│   │   ├── navigation/   # 导航
│   │   └── services/     # 服务
│   └── README.md
├── admin-web/             # 管理后台（React + Vite）
│   ├── src/
│   │   ├── pages/        # 管理页面
│   │   ├── components/   # 组件
│   │   └── api/          # API 调用
│   └── README.md
├── analytics/             # 数据分析
│   ├── analytics/        # 分析脚本
│   ├── database/         # 数据库连接
│   └── visualization/    # 可视化
├── docs/                  # 项目文档
│   ├── project-plan.md   # 项目计划
│   ├── marketing-plan.md # 营销计划
│   └── tech-spec.md      # 技术规格
└── legacy/                # 废弃代码（保留参考）
    ├── slept-app/        # 旧版 App
    └── sleep-checkin/    # 打卡组件
```

## 🚀 快速开始

### 后端 API

```bash
cd api
npm install
npm run start:dev
```

### 移动端 App

```bash
cd app
npm install
npm run ios  # 或 npm run android
```

### 管理后台

```bash
cd admin-web
npm install
npm run dev
```

## 📊 项目状态

- **后端 API:** ✅ 完成
- **移动端 App:** ✅ 完成
- **管理后台:** ✅ 完成
- **数据分析:** 🚧 进行中
- **灰度发布:** 🚧 Phase 1 (5%)

## 📝 文档

### 产品文档
- [项目计划](docs/project-plan.md) - 完整项目规划
- [PRD](docs/PRD-睡了么.md) - 产品需求文档
- [营销计划](docs/marketing-plan.md) - 市场推广方案
- [技术规格](docs/tech-spec.md) - 技术架构说明

### 用户文档
- [用户手册大纲](docs/user-guides/01-用户手册大纲.md)
- [帮助文档 FAQ](docs/user-guides/02-帮助文档 FAQ.md)
- [隐私政策](docs/user-guides/03-隐私政策要点.md)
- [服务条款](docs/user-guides/04-服务条款要点.md)

### 商务文档
- [开发成本估算](docs/business/05-开发成本估算.md)
- [运营成本估算](docs/business/06-运营成本估算.md)
- [收入预测](docs/business/07-收入预测.md)

### API 文档
- [认证 API](api/docs/AUTH-API.md)
- [监督功能 API](api/docs/SUPERVISION_API.md)

## 🔗 相关仓库

- **GitHub:** https://github.com/applerao/shuileme-app（待创建）

---

**最后更新:** 2026-03-11
