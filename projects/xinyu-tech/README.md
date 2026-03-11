# 心语 App

**一个基于性格匹配的社交日记应用**

---

## 项目简介

心语是一款创新的社交应用，结合了日记记录和性格匹配功能。用户可以通过写日记记录生活，通过 AI 辅助提升写作，通过 MBTI 性格测试找到志同道合的朋友。

### 核心功能

- 📔 **日记记录** - 记录生活点滴，支持文字、图片、心情标签
- 🤖 **AI 辅助** - 日记润色、情感分析、写作建议
- 🧩 **性格测试** - MBTI 专业测试，深入了解自己
- 💕 **智能匹配** - 基于性格互补度推荐好友
- 💬 **即时聊天** - 与匹配好友实时沟通
- 👑 **会员服务** - 解锁更多高级功能

---

## 技术栈

### 前端
- React Native 0.73+ (跨平台移动应用)
- TypeScript 5.3+
- Redux Toolkit (状态管理)
- React Navigation (导航)

### 后端
- Node.js 20 LTS
- Express 4.18+
- PostgreSQL 15+ (结构化数据)
- MongoDB 7.0+ (文档数据)
- Redis 7.2+ (缓存)

### AI 服务
- 通义千问 API (日记辅助、情感分析)
- 自研匹配算法

### 基础设施
- 阿里云 ECS + RDS + OSS
- Docker 容器化
- GitHub Actions (CI/CD)

---

## 项目结构

```
xinyu-tech/
├── docs/                    # 文档
│   ├── 技术架构设计.md
│   ├── 数据库设计文档.md
│   ├── API 文档.md
│   └── 测试报告.md
├── src/
│   ├── backend/            # 后端服务
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   ├── frontend/           # 管理后台 (Web)
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── mobile/             # 移动 App (React Native)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── store/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── README.md
│   └── ai/                 # AI 服务
│       ├── src/
│       ├── package.json
│       └── README.md
├── config/                 # 配置文件
├── scripts/                # 脚本工具
├── tests/                  # 测试
├── docker/                 # Docker 配置
├── .github/                # GitHub Actions
└── README.md
```

---

## 快速开始

### 环境要求

- Node.js >= 20
- PostgreSQL >= 15
- MongoDB >= 7.0
- Redis >= 7.2

### 后端启动

```bash
cd src/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接等

# 启动服务
npm run dev
```

### 移动 App 启动

```bash
cd src/mobile

# 安装依赖
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

## 开发计划

| 周次 | 阶段 | 主要任务 |
|------|------|---------|
| 第 1-2 周 | 需求分析 | PRD、原型设计 |
| 第 3 周 | 技术设计 | 架构设计、数据库设计、API 设计 |
| 第 4 周 | 环境搭建 | 项目脚手架、CI/CD |
| 第 5-6 周 | 基础开发 | 用户模块、认证系统 |
| 第 7-8 周 | 核心功能 | 性格测试、匹配算法 |
| 第 9-10 周 | 内容模块 | 日记管理、AI 功能 |
| 第 11-12 周 | 社交功能 | 聊天、会员系统 |
| 第 13 周 | 部署运维 | 生产环境、监控 |
| 第 14 周 | 测试优化 | 全面测试、性能优化 |

---

## 文档链接

- [技术架构设计](./docs/技术架构设计.md)
- [数据库设计文档](./docs/数据库设计文档.md)
- [API 文档](./docs/API 文档.md)

---

## 团队协作

- **代码管理:** GitHub
- **Code Review:** 每个 PR 必须 review
- **每日站会:** 上午 10:00
- **技术分享:** 每周一次

---

## 许可证

Copyright © 2026 心语团队

---

**最后更新:** 2026-03-10
