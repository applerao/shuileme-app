# 睡了么 API - 后端服务

基于 NestJS 的后端 API 服务，提供用户认证、睡眠记录、打卡监督等功能。

## 技术栈

- **框架:** NestJS
- **语言:** TypeScript
- **数据库:** MySQL
- **缓存:** Redis
- **认证:** JWT

## 核心模块

| 模块 | 说明 |
|------|------|
| `auth/` | 用户认证（手机号、微信登录） |
| `users/` | 用户管理 |
| `sleep-records/` | 睡眠记录 |
| `checkins/` | 打卡功能 |
| `supervisions/` | 监督提醒 |
| `push/` | 推送通知 |
| `admin/` | 管理后台接口 |

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 数据库迁移
npm run typeorm migration:run

# 启动开发服务
npm run start:dev

# 启动生产服务
npm run start:prod
```

## API 文档

详见 [docs/](docs/) 目录：

- [认证 API](docs/AUTH-API.md)
- [监督功能 API](docs/SUPERVISION_API.md)

## 测试

```bash
# 单元测试
npm run test

# e2e 测试
npm run test:e2e
```

---

**端口:** 3000  
**环境:** Node.js 18+
