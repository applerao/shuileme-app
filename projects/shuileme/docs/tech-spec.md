# "睡了么" App 技术方案

**版本：** v1.0  
**日期：** 2026-03-06  
**开发周期：** 6 周  
**团队规模建议：** 前端 2 人 + 后端 2 人 + 测试 1 人

---

## 1. 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Client Layer)                        │
│  ┌─────────────────────┐           ┌─────────────────────┐              │
│  │   iOS App           │           │   Android App       │              │
│  │   (React Native)    │           │   (React Native)    │              │
│  └─────────────────────┘           └─────────────────────┘              │
│                    │                         │                           │
│                    └──────────┬──────────────┘                           │
│                               │ HTTPS/WSS                                 │
└───────────────────────────────┼───────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          接入层 (Gateway Layer)                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              阿里云 SLB (Server Load Balancer)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                │                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Nginx (反向代理 + SSL 终止)                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          应用服务层 (App Layer)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   API Gateway   │  │   Auth Service  │  │   User Service  │          │
│  │   (Kong/Nginx)  │  │   (JWT/OAuth)   │  │   (Node.js)     │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   Check-in      │  │   Sleep Record  │  │   Notification  │          │
│  │   Service       │  │   Service       │  │   Service       │          │
│  │   (Node.js)     │  │   (Node.js)     │  │   (Node.js)     │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│  ┌─────────────────┐  ┌─────────────────┐                               │
│  │   WebSocket     │  │   Task Scheduler│                               │
│  │   Server        │  │   (Bull/Cron)   │                               │
│  │   (Socket.io)   │  │                 │                               │
│  └─────────────────┘  └─────────────────┘                               │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          数据层 (Data Layer)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   PostgreSQL    │  │     Redis       │  │   OSS Storage   │          │
│  │   (主数据库)     │  │   (缓存/会话)    │  │   (阿里云)      │          │
│  │   主从复制       │  │   集群模式       │  │   头像/文件      │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        第三方服务层 (3rd Party)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  阿里云 SMS   │ │  极光推送    │ │  友盟统计    │ │  微信登录     │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈选型

### 2.1 前端 (移动端)

| 组件 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 跨平台框架 | **React Native** | 0.73.x | 生态成熟，热更新支持 |
| 状态管理 | Redux Toolkit | 2.0.x | 官方推荐，简洁高效 |
| 导航 | React Navigation | 6.x | 社区标准方案 |
| UI 组件库 | NativeBase | 3.x | 跨平台一致性 |
| 网络请求 | Axios | 1.6.x | 拦截器、取消请求 |
| 本地存储 | AsyncStorage + WatermelonDB | 最新 | 离线数据同步 |
| 推送 | jpush-react-native | 最新 | 极光推送 SDK |
| 构建工具 | EAS Build | 最新 | Expo 应用服务 |

**选择 React Native 而非 Flutter 的理由：**
- 团队已有 React 技术栈积累
- 热更新能力（CodePush）对快速迭代至关重要
- 6 周周期下，npm 生态更丰富，踩坑成本低

### 2.2 后端

| 组件 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 运行时 | **Node.js** | 20.x LTS | 高性能 I/O，前后端语言统一 |
| Web 框架 | NestJS | 10.x | TypeScript 优先，模块化架构 |
| ORM | Prisma | 5.x | 类型安全，迁移管理 |
| 认证 | @nestjs/jwt + Passport | 最新 | JWT + OAuth2 |
| 验证 | class-validator | 最新 | DTO 验证 |
| 定时任务 | Bull + Redis | 4.x | 分布式任务队列 |
| WebSocket | Socket.io | 4.x | 实时通知 |
| 日志 | Winston + Loki | 最新 | 结构化日志 |
| API 文档 | Swagger/OpenAPI | 最新 | 自动生成文档 |

### 2.3 数据库

| 组件 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 主数据库 | **PostgreSQL** | 15.x | 关系型数据，事务支持 |
| 缓存/会话 | **Redis** | 7.x | 热点数据、分布式锁 |
| 连接池 | PgBouncer | 1.x | 连接复用 |

### 2.4 云服务 (阿里云)

| 服务 | 产品 | 规格 | 月成本估算 |
|------|------|------|-----------|
| 计算 | ECS 云服务器 | 2 核 4G × 2 | ¥400 |
| 数据库 | RDS PostgreSQL | 2 核 4G 高可用 | ¥800 |
| 缓存 | Redis 版 | 主从版 2G | ¥300 |
| 存储 | OSS | 标准存储 50GB | ¥50 |
| 负载均衡 | SLB | 性能保障型 | ¥200 |
| 监控 | 云监控 + ARMS | 基础版 | ¥100 |
| **合计** | | | **¥1,850/月** |

### 2.5 开发工具链

| 用途 | 工具 |
|------|------|
| 代码仓库 | GitHub / Gitee |
| CI/CD | GitHub Actions + EAS Submit |
| 接口测试 | Postman / Apifox |
| 文档 | Notion + Swagger |
| 监控 | Sentry + 阿里云 ARMS |

---

## 3. 数据库设计

### 3.1 核心表结构

#### users (用户表)
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) UNIQUE NOT NULL,
    nickname        VARCHAR(50) NOT NULL,
    avatar_url      VARCHAR(500),
    gender          SMALLINT DEFAULT 0,  -- 0:未知 1:男 2:女
    birth_date      DATE,
    timezone        VARCHAR(50) DEFAULT 'Asia/Shanghai',
    sleep_goal_time TIME DEFAULT '23:00:00',
    wake_goal_time  TIME DEFAULT '07:00:00',
    streak_count    INTEGER DEFAULT 0,    -- 连续打卡天数
    total_checkins  INTEGER DEFAULT 0,    -- 总打卡次数
    last_checkin_at TIMESTAMPTZ,
    status          SMALLINT DEFAULT 1,   -- 1:正常 0:禁用
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
```

#### sleep_records (睡眠记录表)
```sql
CREATE TABLE sleep_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_date     DATE NOT NULL,        -- 记录日期
    sleep_time      TIMESTAMPTZ,          -- 入睡时间
    wake_time       TIMESTAMPTZ,          -- 起床时间
    sleep_duration  INTEGER,              -- 睡眠时长 (分钟)
    sleep_quality   SMALLINT,             -- 睡眠质量 1-5 星
    tags            TEXT[],               -- 标签 ["熬夜","早睡","失眠"]
    note            TEXT,                 -- 备注
    source          SMALLINT DEFAULT 1,   -- 1:手动 2:自动 (手表/手环)
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, record_date)
);

CREATE INDEX idx_sleep_records_user_date ON sleep_records(user_id, record_date DESC);
CREATE INDEX idx_sleep_records_date ON sleep_records(record_date);
```

#### checkins (打卡表)
```sql
CREATE TABLE checkins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date    DATE NOT NULL,
    checkin_time    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checkin_type    SMALLINT NOT NULL,    -- 1:早睡打卡 2:早起打卡
    status          SMALLINT DEFAULT 1,   -- 1:成功 0:失败 (超时)
    image_url       VARCHAR(500),         -- 打卡截图
    location        GEOGRAPHY(POINT),     -- 打卡位置
    device_info     JSONB,                -- 设备信息
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, checkin_date, checkin_type)
);

CREATE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date DESC);
CREATE INDEX idx_checkins_date_type ON checkins(checkin_date, checkin_type);
```

#### supervision_relations (监督关系表)
```sql
CREATE TABLE supervision_relations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supervisor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisee_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relation_type   SMALLINT NOT NULL,    -- 1:单向监督 2:互相监督
    status          SMALLINT DEFAULT 1,   -- 1:生效 0:解除 -1:待确认
    reminder_time   TIME,                 -- 提醒时间
    reminder_msg    VARCHAR(200),         -- 自定义提醒语
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(supervisor_id, supervisee_id)
);

CREATE INDEX idx_supervision_supervisor ON supervision_relations(supervisor_id);
CREATE INDEX idx_supervision_supervisee ON supervision_relations(supervisee_id);
CREATE INDEX idx_supervision_status ON supervision_relations(status);
```

#### notifications (通知表)
```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(100) NOT NULL,
    content         TEXT NOT NULL,
    type            SMALLINT NOT NULL,    -- 1:系统 2:监督提醒 3:打卡成功
    is_read         BOOLEAN DEFAULT FALSE,
    link_type       VARCHAR(50),          -- 跳转类型
    link_id         UUID,                 -- 跳转 ID
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### user_devices (用户设备表)
```sql
CREATE TABLE user_devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id       VARCHAR(200) NOT NULL,  -- 推送设备 ID
    device_type     SMALLINT NOT NULL,      -- 1:iOS 2:Android
    push_token      VARCHAR(500),           -- 推送令牌
    app_version     VARCHAR(20),
    last_active_at  TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

CREATE INDEX idx_user_devices_user ON user_devices(user_id);
```

### 3.2 Prisma Schema (供开发使用)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(uuid())
  phone           String    @unique
  nickname        String
  avatarUrl       String?
  gender          Int       @default(0)
  birthDate       DateTime?
  timezone        String    @default("Asia/Shanghai")
  sleepGoalTime   DateTime? @db.Time(6)
  wakeGoalTime    DateTime? @db.Time(6)
  streakCount     Int       @default(0)
  totalCheckins   Int       @default(0)
  lastCheckinAt   DateTime?
  status          Int       @default(1)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sleepRecords    SleepRecord[]
  checkins        Checkin[]
  supervising     SupervisionRelation @relation("Supervisor")
  supervised      SupervisionRelation @relation("Supervisee")
  notifications   Notification[]
  devices         UserDevice[]

  @@index([phone])
  @@index([status])
}

model SleepRecord {
  id            String   @id @default(uuid())
  userId        String
  recordDate    DateTime @db.Date
  sleepTime     DateTime?
  wakeTime      DateTime?
  sleepDuration Int?
  sleepQuality  Int?
  tags          String[]
  note          String?
  source        Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, recordDate])
  @@index([userId, recordDate(sort: Desc)])
}

model Checkin {
  id         String   @id @default(uuid())
  userId     String
  checkinDate DateTime @db.Date
  checkinTime DateTime @default(now())
  checkinType Int
  status     Int      @default(1)
  imageUrl   String?
  location   String?
  deviceInfo Json?
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, checkinDate, checkinType])
  @@index([userId, checkinDate(sort: Desc)])
}

model SupervisionRelation {
  id           String   @id @default(uuid())
  supervisorId String
  superviseeId String
  relationType Int
  status       Int      @default(1)
  reminderTime DateTime? @db.Time(6)
  reminderMsg  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  supervisor   User     @relation("Supervisor", fields: [supervisorId], references: [id], onDelete: Cascade)
  supervisee   User     @relation("Supervisee", fields: [superviseeId], references: [id], onDelete: Cascade)

  @@unique([supervisorId, superviseeId])
  @@index([supervisorId])
  @@index([superviseeId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  content   String
  type      Int
  isRead    Boolean  @default(false)
  linkType  String?
  linkId    String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt(sort: Desc)])
}

model UserDevice {
  id           String   @id @default(uuid())
  userId       String
  deviceId     String
  deviceType   Int
  pushToken    String?
  appVersion   String?
  lastActiveAt DateTime @default(now())
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId])
}
```

---

## 4. API 接口设计

### 4.1 接口规范

- **基础 URL:** `https://api.shuile.me/v1`
- **认证方式:** Bearer Token (JWT)
- **响应格式:** 
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1709712000000
}
```

### 4.2 核心接口列表

#### 认证模块 (Auth)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /auth/sms-code | 获取短信验证码 | ❌ |
| POST | /auth/login | 手机号登录 | ❌ |
| POST | /auth/register | 注册 | ❌ |
| POST | /auth/logout | 登出 | ✅ |
| POST | /auth/refresh | 刷新 Token | ✅ |
| POST | /auth/wechat | 微信登录 | ❌ |

**请求示例 - 获取短信验证码:**
```http
POST /v1/auth/sms-code
Content-Type: application/json

{
  "phone": "13800138000",
  "scene": "login"  // login | register | reset_password
}
```

**响应示例:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "expireIn": 300
  }
}
```

#### 用户模块 (User)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /user/profile | 获取个人信息 | ✅ |
| PUT | /user/profile | 更新个人信息 | ✅ |
| PUT | /user/avatar | 上传头像 | ✅ |
| PUT | /user/sleep-goal | 设置睡眠目标 | ✅ |
| GET | /user/stats | 获取统计数据 | ✅ |
| GET | /user/records | 睡眠记录列表 | ✅ |
| POST | /user/records | 添加睡眠记录 | ✅ |
| PUT | /user/records/:id | 更新睡眠记录 | ✅ |

**请求示例 - 获取统计数据:**
```http
GET /v1/user/stats?startDate=2026-03-01&endDate=2026-03-07
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "code": 200,
  "data": {
    "totalDays": 7,
    "checkinDays": 5,
    "avgSleepDuration": 450,
    "avgSleepTime": "23:30",
    "avgWakeTime": "07:00",
    "streakCount": 3,
    "qualityAvg": 4.2
  }
}
```

#### 打卡模块 (Checkin)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /checkin | 提交打卡 | ✅ |
| GET | /checkin/today | 今日打卡状态 | ✅ |
| GET | /checkin/history | 打卡历史 | ✅ |
| GET | /checkin/ranking | 打卡排行榜 | ✅ |

**请求示例 - 提交打卡:**
```http
POST /v1/checkin
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": 1,  // 1:早睡 2:早起
  "image": "base64...",  // 可选，打卡截图
  "location": {  // 可选
    "latitude": 30.274085,
    "longitude": 120.155070
  },
  "note": "今天准时睡觉啦"
}
```

#### 监督关系模块 (Supervision)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /supervision/invite | 发送监督邀请 | ✅ |
| POST | /supervision/accept | 接受邀请 | ✅ |
| POST | /supervision/reject | 拒绝邀请 | ✅ |
| DELETE | /supervision/:id | 解除关系 | ✅ |
| GET | /supervision/list | 监督列表 | ✅ |
| PUT | /supervision/:id/reminder | 设置提醒 | ✅ |
| POST | /supervision/:id/remind | 手动提醒 | ✅ |

**请求示例 - 发送监督邀请:**
```http
POST /v1/supervision/invite
Content-Type: application/json
Authorization: Bearer <token>

{
  "superviseePhone": "13900139000",
  "relationType": 2,  // 1:单向 2:互相
  "reminderTime": "22:30",
  "reminderMsg": "该睡觉啦！"
}
```

#### 通知模块 (Notification)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /notifications | 通知列表 | ✅ |
| PUT | /notifications/:id/read | 标记已读 | ✅ |
| PUT | /notifications/read-all | 全部已读 | ✅ |
| GET | /notifications/unread-count | 未读数 | ✅ |

#### 设备模块 (Device)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /device/register | 注册设备 | ✅ |
| PUT | /device/push-token | 更新推送令牌 | ✅ |

### 4.3 WebSocket 事件

```javascript
// 连接 URL: wss://api.shuile.me/v1/ws?token=<jwt>

// 客户端订阅
{
  "action": "subscribe",
  "channels": ["notification", "supervision", "checkin"]
}

// 服务端推送 - 新通知
{
  "type": "notification",
  "data": {
    "id": "uuid",
    "title": "监督提醒",
    "content": "你的小伙伴还没睡觉",
    "createdAt": 1709712000000
  }
}

// 服务端推送 - 监督状态变更
{
  "type": "supervision",
  "data": {
    "userId": "uuid",
    "nickname": "小明",
    "status": "checked_in",  // checked_in | not_sleeping
    "timestamp": 1709712000000
  }
}
```

---

## 5. 第三方服务

### 5.1 推送服务 - 极光推送 (JPush)

**选择理由:** 国内到达率高，支持 iOS/Android 统一接入

**配置:**
```yaml
jpush:
  appKey: "your_app_key"
  masterSecret: "your_master_secret"
  production: true
  apnsProduction: true  # iOS 生产环境
```

**集成步骤:**
1. 注册极光开发者账号，创建应用
2. 配置 iOS 推送证书 (开发 + 生产)
3. 配置 Android 包名和签名
4. 前端集成 `jpush-react-native`
5. 后端调用 REST API 发送推送

**推送场景:**
- 监督提醒 (定时 + 手动)
- 打卡成功通知
- 系统公告

### 5.2 统计分析 - 友盟 + (UMeng)

**选择理由:** 免费，功能全面，支持自定义事件

**埋点规划:**
```javascript
// 关键事件
- app_launch: 应用启动
- login_success: 登录成功
- checkin_submit: 提交打卡
- checkin_success: 打卡成功
- supervision_invite: 发送邀请
- supervision_accept: 接受邀请
- sleep_record_add: 添加睡眠记录
- notification_click: 通知点击
```

### 5.3 短信服务 - 阿里云 SMS

**配置:**
```yaml
aliyun:
  accessKeyId: "your_key"
  accessKeySecret: "your_secret"
  signName: "睡了么"
  templateCodes:
    login: "SMS_123456789"
    register: "SMS_123456790"
    resetPassword: "SMS_123456791"
```

**模板示例:**
```
您的验证码是${code}，5 分钟内有效。如非本人操作，请忽略。
```

### 5.4 社交登录 - 微信开放平台

**流程:**
1. 微信开放平台创建移动应用
2. 获取 AppID
3. 前端调用微信 SDK 授权
4. 后端用 code 换取 access_token
5. 获取用户信息并绑定手机号

### 5.5 其他服务

| 服务 | 用途 | 供应商 |
|------|------|--------|
| 对象存储 | 头像、打卡图片 | 阿里云 OSS |
| CDN 加速 | 静态资源 | 阿里云 CDN |
| 短信验证 | 登录注册 | 阿里云 SMS |
| 崩溃监控 | 异常捕获 | Sentry |
| 性能监控 | API 监控 | 阿里云 ARMS |

---

## 6. 安全设计

### 6.1 数据传输安全

```yaml
# HTTPS 强制
- 全站 HTTPS，HSTS 开启
- TLS 1.3 优先
- 证书：阿里云 SSL 证书 (免费 Let's Encrypt 备选)

# 敏感数据加密
- 密码：bcrypt (cost=12)
- 手机号：AES-256 加密存储
- Token: JWT (HS256/RS256)
```

### 6.2 认证授权

**JWT Token 设计:**
```javascript
// Access Token (15 分钟)
{
  "sub": "user_id",
  "phone": "138****8000",
  "role": "user",
  "iat": 1709712000,
  "exp": 1709712900
}

// Refresh Token (7 天，存 Redis)
{
  "sub": "user_id",
  "type": "refresh",
  "iat": 1709712000,
  "exp": 1710316800
}
```

**权限控制:**
```typescript
// NestJS Guard 示例
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    // 只能访问自己的数据
    return this.userService.findOne(user.id);
  }
}
```

### 6.3 接口安全

**限流策略:**
```typescript
// 使用 @nestjs/throttler
// 全局限流：100 次/分钟/IP
// 短信接口：5 次/小时/手机号
// 登录接口：10 次/小时/IP

@Throttle(5, 3600)
@Post('sms-code')
async getSmsCode(@Body() dto: SmsCodeDto) {}
```

**防重放攻击:**
```typescript
// 请求签名
headers: {
  "X-Timestamp": "1709712000",
  "X-Nonce": "random_string",
  "X-Signature": "hmac_sha256(timestamp+nonce+body, secret)"
}
```

### 6.4 隐私保护

**数据脱敏:**
```typescript
// 返回用户信息时脱敏
{
  "phone": "138****8000",
  "nickname": "小明",
  "avatarUrl": "https://..."
}

// 日志脱敏
logger.info('User login', { 
  userId: user.id, 
  phone: maskPhone(user.phone)  // 138****8000
});
```

**隐私合规:**
- [ ] 隐私政策页面 (启动页强制阅读)
- [ ] 用户协议
- [ ] 权限申请说明 (相机、位置、通知)
- [ ] 账号注销功能
- [ ] 数据导出功能
- [ ] 儿童保护模式 (14 岁以下需监护人同意)

### 6.5 安全审计

**日志记录:**
```typescript
// 关键操作审计日志
interface AuditLog {
  userId: string;
  action: 'LOGIN' | 'CHECKIN' | 'SUPERVISION_ADD' | ...;
  ip: string;
  device: string;
  timestamp: Date;
  result: 'SUCCESS' | 'FAILURE';
  details: Record<string, any>;
}
```

**异常监控:**
- Sentry 捕获前端异常
- 后端全局异常过滤器
- 数据库慢查询日志 (>100ms 告警)

---

## 7. 性能优化方案

### 7.1 前端优化

**启动优化:**
```javascript
// 1. 首屏渲染优化
- 使用 React Native Hermes 引擎
- 开启内联引用 (inline requires)
- 懒加载非关键组件

// 2. 包体积优化
- 移除未使用依赖
- 图片压缩 (WebP 格式)
- 按需加载图标

// 目标：冷启动 < 2s，包体积 < 50MB
```

**网络优化:**
```javascript
// 1. 请求合并
const [profile, stats, todayCheckin] = await Promise.all([
  api.getUserProfile(),
  api.getUserStats(),
  api.getTodayCheckin()
]);

// 2. 缓存策略
- 静态数据：本地缓存 24h
- 动态数据：内存缓存 5min
- 图片：CDN + 本地缓存

// 3. 离线支持
- WatermelonDB 本地存储
- 网络恢复后自动同步
```

**渲染优化:**
```javascript
// 1. 列表优化
<FlashList
  data={records}
  renderItem={renderItem}
  estimatedItemSize={100}
/>

// 2. 避免不必要的重渲染
const MemoizedItem = React.memo(Item);

// 3. 图片优化
<Image
  source={{ uri }}
  loadingIndicatorSource={require('./spinner.png')}
  cachePolicy="cache-only"
/>
```

### 7.2 后端优化

**数据库优化:**
```sql
-- 1. 索引优化 (已在上文定义)
-- 2. 查询优化
EXPLAIN ANALYZE SELECT * FROM sleep_records 
WHERE user_id = 'xxx' AND record_date >= '2026-03-01';

-- 3. 连接池配置
-- PgBouncer: pool_mode=transaction, max_client_conn=1000

-- 4. 读写分离
-- 主库：写操作
-- 从库：读操作 (统计数据、历史记录)
```

**缓存策略:**
```typescript
// Redis 缓存设计
const cacheConfig = {
  // 用户信息：5 分钟
  'user:profile:{userId}': { ttl: 300 },
  
  // 统计数据：10 分钟
  'user:stats:{userId}:{date}': { ttl: 600 },
  
  // 今日打卡状态：5 分钟
  'checkin:today:{userId}': { ttl: 300 },
  
  // 短信验证码：5 分钟
  'sms:code:{phone}': { ttl: 300 },
  
  // 用户 Token 黑名单：等于 Token 剩余有效期
  'token:blacklist:{jti}': { ttl: 'dynamic' }
};

// 缓存击穿防护
async function getUserProfile(userId: string) {
  const key = `user:profile:${userId}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  // 分布式锁防止缓存击穿
  const lock = await redis.set(`lock:${key}`, '1', 'EX', 10, 'NX');
  if (!lock) {
    await sleep(100);
    return this.getUserProfile(userId);
  }
  
  try {
    const profile = await db.user.findUnique({ where: { id: userId } });
    await redis.setex(key, 300, JSON.stringify(profile));
    return profile;
  } finally {
    await redis.del(`lock:${key}`);
  }
}
```

**API 响应优化:**
```typescript
// 1. 分页查询
GET /user/records?page=1&pageSize=20&startDate=2026-03-01

// 2. 字段过滤
GET /user/profile?fields=id,nickname,avatarUrl

// 3. 响应压缩
app.use(compression());  // gzip 压缩

// 4. 目标：P95 < 200ms, P99 < 500ms
```

### 7.3 定时任务优化

**任务队列设计:**
```typescript
// Bull 队列配置
const queueConfig = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
};

// 任务类型
// 1. 监督提醒任务 (每晚 21:00-23:00 高频)
// 2. 打卡超时任务 (次日 09:00 检查)
// 3. 数据统计任务 (每日 01:00 聚合)
// 4. 推送清理任务 (每日 03:00 清理失效设备)
```

### 7.4 监控告警

**监控指标:**
```yaml
# 应用指标
- QPS (请求数/秒)
- 响应时间 (P50/P95/P99)
- 错误率 (4xx/5xx)
- 活跃用户数

# 系统指标
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络带宽

# 业务指标
- 日活 (DAU)
- 打卡成功率
- 推送到达率
- 短信发送成功率

# 告警阈值
- 错误率 > 1%: 警告
- 错误率 > 5%: 严重
- 响应时间 P95 > 500ms: 警告
- CPU > 80%: 警告
```

---

## 8. 开发计划 (6 周)

### Week 1: 项目初始化
- [ ] 技术栈搭建 (RN + NestJS)
- [ ] 数据库设计与迁移
- [ ] 基础 CI/CD 配置
- [ ] 开发规范制定

### Week 2: 核心功能 - 用户 + 认证
- [ ] 短信登录/注册
- [ ] 微信登录
- [ ] 用户资料管理
- [ ] Token 刷新机制

### Week 3: 核心功能 - 打卡 + 睡眠记录
- [ ] 早睡/早起打卡
- [ ] 睡眠记录 CRUD
- [ ] 打卡统计
- [ ] 数据可视化

### Week 4: 核心功能 - 监督关系
- [ ] 监督邀请流程
- [ ] 监督列表
- [ ] 提醒设置
- [ ] WebSocket 实时通知

### Week 5: 第三方服务 + 优化
- [ ] 极光推送集成
- [ ] 友盟埋点
- [ ] 性能优化
- [ ] 安全加固

### Week 6: 测试 + 上线
- [ ] 单元测试 (覆盖率>80%)
- [ ] 集成测试
- [ ] 灰度发布
- [ ] 应用商店提交

---

## 9. 风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 6 周周期紧张 | 高 | 高 | 优先 MVP 功能，砍掉非核心需求 |
| iOS 审核被拒 | 中 | 高 | 提前准备审核材料，预留 1 周缓冲 |
| 推送到达率低 | 中 | 中 | 双通道推送 (极光 + 厂商) |
| 并发压力 | 低 | 中 | 初期单实例，预留扩容方案 |
| 数据安全问题 | 低 | 高 | 安全审计 + 渗透测试 |

---

## 10. 附录

### 10.1 项目目录结构

```
slept-app/
├── mobile/                 # React Native 前端
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── screens/       # 页面
│   │   ├── store/         # Redux 状态
│   │   ├── services/      # API 服务
│   │   ├── utils/         # 工具函数
│   │   └── navigation/    # 路由配置
│   ├── package.json
│   └── eas.json
│
├── server/                 # NestJS 后端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── checkin/
│   │   │   ├── sleep/
│   │   │   ├── supervision/
│   │   │   └── notification/
│   │   ├── common/
│   │   ├── config/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── test/
│   └── package.json
│
├── docs/                   # 文档
│   ├── api/               # API 文档
│   ├── design/            # 设计稿
│   └── deploy/            # 部署文档
│
└── infra/                  # 基础设施
    ├── docker/
    ├── k8s/
    └── terraform/
```

### 10.2 环境变量示例

```bash
# .env.example

# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/slept?schema=public"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# 阿里云
ALIYUN_ACCESS_KEY_ID="xxx"
ALIYUN_ACCESS_KEY_SECRET="xxx"
ALIYUN_SMS_SIGN_NAME="睡了么"

# 极光推送
JPUSH_APP_KEY="xxx"
JPUSH_MASTER_SECRET="xxx"

# 微信
WECHAT_APP_ID="xxx"
WECHAT_APP_SECRET="xxx"

# 友盟
UMENG_APP_KEY="xxx"

# 环境
NODE_ENV="production"
API_PREFIX="/v1"
```

---

**文档版本:** v1.0  
**最后更新:** 2026-03-06  
**维护者:** 技术架构组
