# 认证 API 文档

## 概述

认证模块提供用户注册、登录、微信登录和验证码发送功能。

**Base URL:** `/api/v1/auth`

---

## 接口列表

### 1. 发送验证码

**POST** `/api/v1/auth/send-code`

发送短信验证码到指定手机号。

#### 请求参数

```json
{
  "phone": "13800138000"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 中国大陆手机号 |

#### 响应示例

```json
{
  "success": true
}
```

#### 状态码

- `200` - 发送成功
- `400` - 手机号格式错误
- `429` - 请求过于频繁

---

### 2. 用户注册

**POST** `/api/v1/auth/register`

使用手机号、密码和验证码注册新用户。

#### 请求参数

```json
{
  "phone": "13800138000",
  "password": "password123",
  "code": "123456",
  "nickname": "睡友 123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 中国大陆手机号 |
| password | string | 是 | 密码（最少 6 位） |
| code | string | 是 | 短信验证码（6 位） |
| nickname | string | 否 | 昵称（默认：睡友 + 手机尾号） |

#### 响应示例

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "13800138000",
    "nickname": "睡友 123",
    "avatar": null,
    "wechatId": null,
    "createdAt": "2026-03-07T10:00:00.000Z"
  }
}
```

#### 状态码

- `201` - 注册成功
- `400` - 验证码错误或已过期 / 手机号已注册
- `422` - 参数验证失败

---

### 3. 用户登录

**POST** `/api/v1/auth/login`

使用手机号和密码登录。

#### 请求参数

```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 中国大陆手机号 |
| password | string | 是 | 密码 |

#### 响应示例

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "13800138000",
    "nickname": "睡友 123",
    "avatar": "https://example.com/avatar.jpg",
    "wechatId": null,
    "createdAt": "2026-03-07T10:00:00.000Z"
  }
}
```

#### 状态码

- `200` - 登录成功
- `401` - 手机号或密码错误 / 账号已被禁用
- `422` - 参数验证失败

---

### 4. 微信登录

**POST** `/api/v1/auth/wechat`

使用微信授权码登录。如果是新用户，会自动创建账号。

#### 请求参数

```json
{
  "wechatCode": "wechat_auth_code_xxxxx"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| wechatCode | string | 是 | 微信授权码（从小程序 wx.login 获取） |

#### 响应示例

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "wechat_oXXXXX",
    "nickname": "微信用户",
    "avatar": "https://wx.qlogo.cn/mmopen/...",
    "wechatId": "oXXXXX",
    "createdAt": "2026-03-07T10:00:00.000Z"
  }
}
```

#### 状态码

- `200` - 登录成功
- `400` - 微信授权码无效
- `401` - 账号已被禁用
- `422` - 参数验证失败

---

## JWT 认证

所有需要认证的接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

### Token 说明

- **有效期**: 7 天（可通过 `JWT_EXPIRATION` 环境变量配置）
- **Payload**:
  ```json
  {
    "sub": "user-uuid",
    "phone": "13800138000",
    "wechatId": "oXXXXX",
    "iat": 1709780000,
    "exp": 1710384800
  }
  ```

---

## 错误响应格式

```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification code",
  "error": "Bad Request"
}
```

---

## 环境配置

在 `.env` 文件中配置以下变量：

```bash
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# WeChat
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# SMS (示例：阿里云短信)
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY_ID=your_sms_access_key_id
SMS_ACCESS_KEY_SECRET=your_sms_access_key_secret
SMS_SIGN_NAME=睡了么
SMS_TEMPLATE_CODE=SMS_123456789
```

---

## 数据库迁移

运行以下命令创建验证码表：

```bash
npm run migration:run
```

---

## 安全建议

1. **生产环境**必须修改 `JWT_SECRET`
2. 短信验证码应设置合理的过期时间（建议 5 分钟）
3. 实现短信发送频率限制（如：1 分钟 1 次，1 小时 5 次，24 小时 10 次）
4. 密码应使用 bcrypt 加密存储（已实现）
5. 建议实现登录失败次数限制
