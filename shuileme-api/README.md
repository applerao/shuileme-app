# 睡了么 API

Sleep tracking and supervision app backend built with NestJS.

## 项目信息

- **名称**: 睡了么 API
- **框架**: NestJS 10
- **语言**: TypeScript
- **数据库**: PostgreSQL 15 + Redis 7

## 功能特性

- ✅ 手机号注册/登录 (短信验证码)
- ✅ 微信登录
- ✅ JWT 认证
- ✅ 每日打卡
- ✅ 监督关系管理
- ✅ 睡眠记录追踪
- ✅ 成就系统
- ✅ 数据统计分析

## 技术栈

- **Backend**: NestJS 10, TypeScript
- **Database**: PostgreSQL 15, TypeORM
- **Cache**: Redis 7
- **Authentication**: JWT (passport-jwt)
- **Documentation**: Swagger/OpenAPI

## 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL 15
- Redis 7

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 启动开发服务器

```bash
npm run start:dev
```

### 构建生产版本

```bash
npm run build
npm run start:prod
```

## API 文档

启动服务后访问：http://localhost:3000/docs

## 数据库表结构

### users - 用户表
- id, phone, password, nickname, avatar, wechatId
- totalCheckinDays, continuousCheckinDays, isActive, lastCheckinDate
- createdAt, updatedAt

### verification_codes - 验证码表
- id, phone, code, type (register/login/reset_password)
- used, expiresAt, createdAt

### checkins - 打卡记录表
- id, userId, checkinDate, checkinTime, status, note, sleepQuality
- createdAt, supervisedBy

### supervisions - 监督关系表
- id, supervisorId, superviseeId, status, message
- createdAt, updatedAt, approvedAt, rejectedAt

### sleep_records - 睡眠记录表
- id, userId, bedtime, wakeTime, sleepDuration
- deepSleepDuration, lightSleepDuration, awakeDuration
- sleepQuality, note, recordDate, createdAt

### achievements - 成就表
- id, userId, type, name, description, level
- isUnlocked, unlockedAt, progress, target, createdAt

### notifications - 通知表
- id, userId, type, title, content, isRead, readAt, metadata, createdAt

## API 接口

### 认证模块
- `POST /api/v1/auth/send-code` - 发送验证码
- `POST /api/v1/auth/register` - 用户注册 (手机号 + 密码 + 验证码)
- `POST /api/v1/auth/login` - 用户登录 (手机号 + 密码)
- `POST /api/v1/auth/wechat` - 微信登录

### 用户模块
- `GET /api/v1/users/me` - 获取当前用户信息
- `PATCH /api/v1/users/me` - 更新用户信息
- `GET /api/v1/users` - 获取用户列表
- `GET /api/v1/users/:id` - 获取用户详情

### 打卡模块
- `POST /api/v1/checkins` - 创建打卡
- `GET /api/v1/checkins` - 获取打卡列表
- `GET /api/v1/checkins/stats` - 获取打卡统计
- `GET /api/v1/checkins/:id` - 获取打卡详情
- `DELETE /api/v1/checkins/:id` - 删除打卡

### 监督模块
- `POST /api/v1/supervisions` - 创建监督申请
- `GET /api/v1/supervisions` - 获取监督关系列表
- `GET /api/v1/supervisions/active` - 获取活跃监督关系
- `PATCH /api/v1/supervisions/:id/approve` - 批准申请
- `PATCH /api/v1/supervisions/:id/reject` - 拒绝申请
- `PATCH /api/v1/supervisions/:id/cancel` - 取消关系

### 睡眠记录模块
- `POST /api/v1/sleep-records` - 创建睡眠记录
- `GET /api/v1/sleep-records` - 获取睡眠记录列表
- `GET /api/v1/sleep-records/stats` - 获取睡眠统计
- `GET /api/v1/sleep-records/:id` - 获取睡眠记录详情
- `PATCH /api/v1/sleep-records/:id` - 更新睡眠记录
- `DELETE /api/v1/sleep-records/:id` - 删除睡眠记录

### 成就模块
- `GET /api/v1/achievements` - 获取成就列表
- `GET /api/v1/achievements/unlocked` - 获取已解锁成就
- `GET /api/v1/achievements/:id` - 获取成就详情

## 项目结构

```
shuileme-api/
├── src/
│   ├── auth/                 # 认证模块
│   ├── users/                # 用户模块
│   ├── checkins/             # 打卡模块
│   ├── supervisions/         # 监督模块
│   ├── sleep-records/        # 睡眠记录模块
│   ├── achievements/         # 成就模块
│   ├── common/               # 公共模块
│   │   ├── guards/           # 认证守卫
│   │   ├── decorators/       # 装饰器
│   │   ├── filters/          # 异常过滤器
│   │   ├── interceptors/     # 拦截器
│   │   └── entities/         # 公共实体
│   └── config/               # 配置文件
├── test/                     # 测试文件
├── .env.example              # 环境变量示例
├── .eslintrc.js              # ESLint 配置
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目说明
```

## 开发规范

- 使用 ESLint + Prettier 进行代码格式化
- 使用 Swagger 进行 API 文档管理
- 使用 TypeORM 进行数据库操作
- 所有 API 需要 JWT 认证 (除登录注册外)

## License

MIT
