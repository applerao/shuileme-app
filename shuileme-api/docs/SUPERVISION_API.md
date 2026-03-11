# 社交监督功能 API 文档

## 概述

社交监督功能允许用户之间建立监督关系，互相监督早睡等习惯，并可以发送提醒消息。

## 数据库表结构

### supervisions 表（监督关系）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| supervisor_id | uuid | 监督者 ID（外键 -> users.id） |
| supervisee_id | uuid | 被监督者 ID（外键 -> users.id） |
| status | enum | 状态：pending, active, rejected, cancelled |
| message | text | 申请消息（可选） |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| approved_at | timestamp | 批准时间（可选） |
| rejected_at | timestamp | 拒绝时间（可选） |

### supervision_messages 表（互动消息）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| supervision_id | uuid | 监督关系 ID（外键 -> supervisions.id） |
| sender_id | uuid | 发送者 ID（外键 -> users.id） |
| receiver_id | uuid | 接收者 ID（外键 -> users.id） |
| type | enum | 消息类型：remind, encourage, custom |
| message | text | 消息内容 |
| is_read | boolean | 是否已读 |
| created_at | timestamp | 创建时间 |

## API 端点

所有 API 都需要 JWT 认证（Bearer Token）。

### 1. 添加监督者

**POST** `/api/supervision/add`

创建监督关系申请。

**请求参数：**
```json
{
  "userId": "用户 UUID",
  "supervisorId": "监督者 UUID"
}
```

**返回：**
```json
{
  "id": "监督关系 UUID",
  "supervisorId": "监督者 UUID",
  "superviseeId": "被监督者 UUID",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  ...
}
```

### 2. 获取监督关系列表

**GET** `/api/supervision/list?userId={userId}`

获取用户的监督关系列表，包括监督者和被监督者。

**查询参数：**
- `userId`: 用户 UUID

**返回：**
```json
{
  "supervisors": [
    {
      "id": "监督关系 UUID",
      "supervisorId": "监督者 UUID",
      "superviseeId": "当前用户 UUID",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      ...
    }
  ],
  "supervisees": [
    {
      "id": "监督关系 UUID",
      "supervisorId": "当前用户 UUID",
      "superviseeId": "被监督者 UUID",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      ...
    }
  ]
}
```

### 3. 发送提醒消息

**POST** `/api/supervision/remind`

向监督关系中的对方发送提醒消息。

**请求参数：**
```json
{
  "userId": "接收者 UUID",
  "message": "提醒消息内容",
  "type": "remind"  // 可选：remind, encourage, custom
}
```

**返回：**
```json
{
  "id": "消息 UUID",
  "supervisionId": "监督关系 UUID",
  "senderId": "发送者 UUID",
  "receiverId": "接收者 UUID",
  "type": "remind",
  "message": "提醒消息内容",
  "isRead": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. 获取监督消息列表

**GET** `/api/supervisions/messages`

获取当前用户的所有监督消息（发送和接收的）。

**返回：**
```json
[
  {
    "id": "消息 UUID",
    "supervisionId": "监督关系 UUID",
    "senderId": "发送者 UUID",
    "receiverId": "接收者 UUID",
    "type": "remind",
    "message": "消息内容",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 5. 标记消息为已读

**PATCH** `/api/supervisions/messages/:id/read`

标记指定消息为已读。

**返回：**
```json
{
  "id": "消息 UUID",
  ...
  "isRead": true,
  ...
}
```

## 其他现有端点

以下端点也已实现：

- `POST /api/supervisions` - 创建监督关系申请（带消息）
- `GET /api/supervisions` - 获取我的监督关系列表
- `GET /api/supervisions/active` - 获取活跃的监督关系
- `GET /api/supervisions/:id` - 根据 ID 获取监督关系
- `PATCH /api/supervisions/:id/approve` - 批准监督申请
- `PATCH /api/supervisions/:id/reject` - 拒绝监督申请
- `PATCH /api/supervisions/:id/cancel` - 取消监督关系

## 监督关系状态

- `pending`: 待批准
- `active`: 活跃（已批准）
- `rejected`: 已拒绝
- `cancelled`: 已取消

## 消息类型

- `remind`: 提醒消息
- `encourage`: 鼓励消息
- `custom`: 自定义消息
