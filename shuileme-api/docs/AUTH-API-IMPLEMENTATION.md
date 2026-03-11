# 用户认证 API - 核心实现

## ✅ 已完成功能

### 1. User 实体 (`src/users/user.entity.ts`)
- `id`: UUID 主键
- `phone`: 手机号（唯一）
- `password`: bcrypt 加密密码
- `createdAt`: 创建时间
- 自动密码哈希（BeforeInsert/BeforeUpdate）
- `comparePassword()` 方法验证密码

### 2. AuthModule (`src/auth/auth.module.ts`)
- JWT 模块配置
- Passport 认证
- 依赖注入：UsersModule, VerificationCodesModule, WechatModule

### 3. AuthService (`src/auth/auth.service.ts`)
- `sendCode(phone)`: 发送验证码
- `register(registerDto)`: 用户注册
- `login(phone, password)`: 用户登录
- `generateToken(user)`: JWT token 生成
- `validateUser(payload)`: JWT 验证

### 4. AuthController (`src/auth/auth.controller.ts`)

#### POST /api/auth/send-code
```typescript
{
  "phone": "13800138000"
}
```
- 发送 6 位验证码到手机号
- 有效期 5 分钟
- 频率限制：3 次/10 秒

#### POST /api/auth/register
```typescript
{
  "phone": "13800138000",
  "password": "password123",
  "code": "123456",
  "nickname": "睡友 123" // 可选
}
```
- 验证验证码
- 检查手机号是否已注册
- 创建用户并返回 JWT token

#### POST /api/auth/login
```typescript
{
  "phone": "13800138000",
  "password": "password123"
}
```
- 验证手机号和密码
- 检查账户状态
- 返回 JWT token

### 5. JWT Token (`src/auth/strategies/jwt.strategy.ts`)
- Payload: `{ sub: userId, phone, wechatId }`
- 有效期：7 天（可配置）
- Bearer Token 认证

### 6. 验证码模块 (`src/verification-codes/`)
- `VerificationCode` 实体
- 6 位数字验证码
- 5 分钟有效期
- 一次性使用

## 🔐 安全特性

- **bcrypt 密码加密**: 10 轮哈希（可配置）
- **JWT 认证**: 无状态 token
- **频率限制**: 防止暴力破解
- **验证码验证**: 注册时必须验证短信验证码
- **密码选择器排除**: 查询时不返回 password 字段

## 📁 核心文件列表

```
src/
├── users/
│   ├── user.entity.ts          # User 实体
│   ├── users.service.ts        # 用户服务
│   └── users.module.ts
├── auth/
│   ├── auth.controller.ts      # 认证控制器
│   ├── auth.service.ts         # 认证服务
│   ├── auth.module.ts          # 认证模块
│   ├── dto/
│   │   ├── register.dto.ts     # 注册 DTO
│   │   ├── login.dto.ts        # 登录 DTO
│   │   ├── send-code.dto.ts    # 发送验证码 DTO
│   │   └── auth-response.dto.ts # 响应 DTO
│   ├── guards/
│   │   ├── jwt-auth.guard.ts   # JWT 守卫
│   │   └── local-auth.guard.ts # 本地守卫
│   └── strategies/
│       └── jwt.strategy.ts     # JWT 策略
└── verification-codes/
    ├── verification-code.entity.ts
    ├── verification-codes.service.ts
    └── verification-codes.module.ts
```

## 🚀 启动命令

```bash
cd shuileme-api
npm install
npm run start:dev
```

API 文档：http://localhost:3000/api/docs
