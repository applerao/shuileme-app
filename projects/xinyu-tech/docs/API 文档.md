# 心语 App API 文档

**版本：** 1.0  
**创建日期：** 2026-03-10  
**负责人：** Backend Architect + API Tester  
**截止时间：** 第 4 周周一

---

## 1. API 概览

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基础 URL | `https://api.xinyu.app/api/v1` |
| 认证方式 | JWT Bearer Token |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 限流策略 | 100 次/分钟/IP（普通接口） |

### 1.2 统一响应格式

**成功响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": 1709999999999
}
```

**错误响应:**
```json
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ],
  "timestamp": 1709999999999
}
```

### 1.3 认证机制

所有需要认证的接口需要在 Header 中携带 Token:

```
Authorization: Bearer <jwt_token>
```

Token 获取方式：用户登录后返回 access_token

---

## 2. 用户认证模块

### 2.1 用户注册

**接口:** `POST /auth/register`

**请求:**
```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "SecurePass123!",
  "phone": "13800138000",
  "verifyCode": "123456"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "avatar_url": null,
      "created_at": "2026-03-10T10:00:00Z"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 604800
    }
  }
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 40001 | 用户名已存在 |
| 40002 | 邮箱已注册 |
| 40003 | 手机号已注册 |
| 40004 | 验证码错误或已过期 |
| 40005 | 密码强度不足 |

---

### 2.2 用户登录

**接口:** `POST /auth/login`

**请求:**
```json
{
  "account": "zhangsan@example.com",
  "password": "SecurePass123!",
  "device_id": "device_unique_id"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "avatar_url": "https://oss.xinyu.app/avatars/xxx.png",
      "personality_type": "INTJ",
      "is_vip": false
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 604800
    }
  }
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 40101 | 账号或密码错误 |
| 40102 | 账号已被禁用 |
| 40103 | 登录过于频繁，请稍后重试 |

---

### 2.3 刷新 Token

**接口:** `POST /auth/refresh`

**请求:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 604800
  }
}
```

---

### 2.4 用户登出

**接口:** `POST /auth/logout`

**请求:** (Header 携带 Token)

**响应:**
```json
{
  "code": 200,
  "message": "登出成功"
}
```

---

### 2.5 获取当前用户信息

**接口:** `GET /users/me`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "phone": "138****8000",
    "avatar_url": "https://oss.xinyu.app/avatars/xxx.png",
    "gender": 1,
    "birthday": "1990-01-01",
    "location": "北京",
    "bio": "热爱生活，喜欢探索",
    "personality_type": "INTJ",
    "personality_scores": {
      "E": 30, "I": 70,
      "S": 40, "N": 60,
      "T": 65, "F": 35,
      "J": 75, "P": 25
    },
    "is_vip": false,
    "vip_expires_at": null,
    "created_at": "2026-03-10T10:00:00Z"
  }
}
```

---

### 2.6 更新用户信息

**接口:** `PUT /users/me`

**请求:**
```json
{
  "avatar_url": "https://oss.xinyu.app/avatars/new.png",
  "gender": 1,
  "birthday": "1990-01-01",
  "location": "上海",
  "bio": "新的个人简介"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "zhangsan",
    "avatar_url": "https://oss.xinyu.app/avatars/new.png",
    "updated_at": "2026-03-10T12:00:00Z"
  }
}
```

---

### 2.7 修改密码

**接口:** `PUT /users/me/password`

**请求:**
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass456!"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 40006 | 原密码错误 |
| 40005 | 新密码强度不足 |

---

## 3. 性格测试模块

### 3.1 获取测试题目

**接口:** `GET /tests/questions`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0",
    "total_questions": 28,
    "estimated_time": 300,
    "questions": [
      {
        "id": 1,
        "category": "E/I",
        "question_text": "在社交聚会上，你通常会？",
        "options": [
          { "key": "A", "text": "主动与很多人交流，包括陌生人" },
          { "key": "B", "text": "只与几个熟悉的人交流" }
        ]
      },
      {
        "id": 2,
        "category": "S/N",
        "question_text": "你更倾向于？",
        "options": [
          { "key": "A", "text": "关注具体事实和细节" },
          { "key": "B", "text": "关注整体概念和可能性" }
        ]
      }
      // ... 更多题目
    ]
  }
}
```

---

### 3.2 提交测试结果

**接口:** `POST /tests/submit`

**请求:**
```json
{
  "answers": [
    { "question_id": 1, "answer": "A" },
    { "question_id": 2, "answer": "B" }
    // ... 所有题目答案
  ],
  "time_spent": 280  // 耗时（秒）
}
```

**响应:**
```json
{
  "code": 200,
  "message": "测试完成",
  "data": {
    "test_id": "test_uuid",
    "result_type": "INTJ",
    "result_name": "建筑师型人格",
    "scores": {
      "E": 25, "I": 75,
      "S": 35, "N": 65,
      "T": 70, "F": 30,
      "J": 80, "P": 20
    },
    "description": "INTJ 型人格是独立、创新的思想者...",
    "strengths": ["战略思维", "独立", "决心"],
    "weaknesses": ["傲慢", "情感表达困难"],
    "career_suggestions": ["科学家", "工程师", "战略顾问"],
    "relationship_advice": "在亲密关系中需要学会表达情感...",
    "report_url": "https://api.xinyu.app/reports/test_uuid.pdf"
  }
}
```

---

### 3.3 获取测试历史

**接口:** `GET /tests/history`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 3,
    "tests": [
      {
        "test_id": "test_uuid_1",
        "result_type": "INTJ",
        "completed_at": "2026-03-10T10:00:00Z",
        "time_spent": 280
      },
      {
        "test_id": "test_uuid_2",
        "result_type": "INTP",
        "completed_at": "2026-02-01T10:00:00Z",
        "time_spent": 300
      }
    ]
  }
}
```

---

## 4. 日记管理模块

### 4.1 发布日记

**接口:** `POST /diaries`

**请求:**
```json
{
  "title": "今天的心情",
  "content": "今天发生了很多有趣的事情...",
  "mood": "😊",
  "tags": ["工作", "生活", "感悟"],
  "images": [
    { "url": "https://oss.xinyu.app/diaries/xxx1.jpg" }
  ],
  "is_public": false,
  "location": {
    "name": "北京",
    "coordinates": [116.4074, 39.9042]
  },
  "enable_ai_analysis": true
}
```

**响应:**
```json
{
  "code": 200,
  "message": "日记发布成功",
  "data": {
    "id": "diary_objectid",
    "title": "今天的心情",
    "mood": "😊",
    "created_at": "2026-03-10T10:00:00Z",
    "ai_analysis": {
      "emotion_score": 75,
      "primary_emotion": "快乐",
      "writing_suggestions": "..."
    }
  }
}
```

---

### 4.2 获取日记列表

**接口:** `GET /diaries`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| limit | int | 否 | 每页数量，默认 20 |
| type | string | 否 | all/my/public |
| mood | string | 否 | 心情筛选 |
| tag | string | 否 | 标签筛选 |
| start_date | date | 否 | 开始日期 |
| end_date | date | 否 | 结束日期 |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "diaries": [
      {
        "id": "diary_objectid",
        "title": "今天的心情",
        "content_preview": "今天发生了很多有趣的事情...",
        "mood": "😊",
        "tags": ["工作", "生活"],
        "images": ["https://oss.xinyu.app/diaries/xxx1.jpg"],
        "emotion_score": 75,
        "is_public": false,
        "view_count": 0,
        "like_count": 0,
        "created_at": "2026-03-10T10:00:00Z"
      }
    ]
  }
}
```

---

### 4.3 获取日记详情

**接口:** `GET /diaries/:id`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "diary_objectid",
    "title": "今天的心情",
    "content": "今天发生了很多有趣的事情...",
    "mood": "😊",
    "tags": ["工作", "生活", "感悟"],
    "images": [
      {
        "url": "https://oss.xinyu.app/diaries/xxx1.jpg",
        "thumbnail": "https://oss.xinyu.app/diaries/xxx1_thumb.jpg"
      }
    ],
    "ai_suggestions": {
      "writing_help": "可以尝试更详细地描述...",
      "polish_version": "优化后的版本...",
      "emotion_analysis": {
        "primary_emotion": "快乐",
        "score": 75,
        "description": "整体情绪积极向上"
      }
    },
    "emotion_score": 75,
    "is_public": false,
    "view_count": 10,
    "like_count": 5,
    "comment_count": 2,
    "location": {
      "name": "北京",
      "coordinates": [116.4074, 39.9042]
    },
    "created_at": "2026-03-10T10:00:00Z",
    "updated_at": "2026-03-10T10:00:00Z"
  }
}
```

---

### 4.4 更新日记

**接口:** `PUT /diaries/:id`

**请求:**
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "mood": "😄",
  "tags": ["工作", "成长"],
  "is_public": true
}
```

**响应:**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "diary_objectid",
    "updated_at": "2026-03-10T12:00:00Z"
  }
}
```

---

### 4.5 删除日记

**接口:** `DELETE /diaries/:id`

**响应:**
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 4.6 日记点赞

**接口:** `POST /diaries/:id/like`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "liked": true,
    "like_count": 6
  }
}
```

---

### 4.7 AI 日记辅助

**接口:** `POST /diaries/ai/assist`

**请求:**
```json
{
  "content": "今天工作很忙，但是完成了一个重要项目...",
  "type": "polish"  // polish, expand, summarize, analyze
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "type": "polish",
    "original": "今天工作很忙，但是完成了一个重要项目...",
    "result": "今日工作虽繁忙，但幸得完成关键项目，颇有成就感...",
    "emotion_analysis": {
      "primary_emotion": "成就感",
      "score": 70
    }
  }
}
```

---

## 5. 匹配功能模块

### 5.1 获取推荐列表

**接口:** `GET /matches/recommendations`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| limit | int | 否 | 每页数量，默认 10 |
| location | string | 否 | 城市筛选 |
| age_range | string | 否 | 年龄范围，如 "25-30" |
| personality_types | string | 否 | MBTI 类型，如 "INTJ,INTP" |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "recommendations": [
      {
        "user_id": "user_uuid_1",
        "username": "lisi",
        "avatar_url": "https://oss.xinyu.app/avatars/xxx.png",
        "age": 28,
        "location": "北京",
        "personality_type": "ENFP",
        "match_score": 92,
        "match_reasons": [
          { "type": "personality", "description": "性格互补度高" },
          { "type": "location", "description": "同城" },
          { "type": "interests", "description": "共同爱好：阅读、旅行" }
        ],
        "bio": "热爱生活，喜欢探索新事物"
      }
    ]
  }
}
```

---

### 5.2 喜欢

**接口:** `POST /matches/:user_id/like`

**请求:**
```json
{
  "message": "嗨，很高兴认识你！"  // 可选，首次匹配时
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "match_id": "match_uuid",
    "status": "pending",  // pending, matched
    "is_mutual": false
  }
}
```

---

### 5.3 跳过

**接口:** `POST /matches/:user_id/pass`

**响应:**
```json
{
  "code": 200,
  "message": "success"
}
```

---

### 5.4 获取匹配列表

**接口:** `GET /matches`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | pending/matched/all |
| page | int | 否 | 页码 |
| limit | int | 否 | 每页数量 |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "matches": [
      {
        "match_id": "match_uuid",
        "user": {
          "user_id": "user_uuid_1",
          "username": "lisi",
          "avatar_url": "https://oss.xinyu.app/avatars/xxx.png",
          "personality_type": "ENFP"
        },
        "match_score": 92,
        "status": "matched",
        "matched_at": "2026-03-10T10:00:00Z",
        "last_message": {
          "content": "你好呀！",
          "created_at": "2026-03-10T11:00:00Z"
        }
      }
    ]
  }
}
```

---

## 6. 聊天功能模块

### 6.1 获取会话列表

**接口:** `GET /conversations`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "conversations": [
      {
        "conversation_id": "user1_user2",
        "partner": {
          "user_id": "user_uuid_1",
          "username": "lisi",
          "avatar_url": "https://oss.xinyu.app/avatars/xxx.png",
          "online": true
        },
        "last_message": {
          "content": "你好呀！",
          "sender_id": "user_uuid_1",
          "type": "text",
          "created_at": "2026-03-10T11:00:00Z"
        },
        "unread_count": 2,
        "is_muted": false,
        "updated_at": "2026-03-10T11:00:00Z"
      }
    ]
  }
}
```

---

### 6.2 获取消息列表

**接口:** `GET /conversations/:conversation_id/messages`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cursor | string | 否 | 分页游标 |
| limit | int | 否 | 每页数量，默认 50 |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "messages": [
      {
        "id": "msg_objectid",
        "sender_id": "user_uuid_1",
        "receiver_id": "current_user_id",
        "content": "你好呀！",
        "type": "text",
        "status": "read",
        "created_at": "2026-03-10T11:00:00Z",
        "read_at": "2026-03-10T11:01:00Z"
      },
      {
        "id": "msg_objectid_2",
        "sender_id": "current_user_id",
        "receiver_id": "user_uuid_1",
        "content": "你好！很高兴认识你",
        "type": "text",
        "status": "read",
        "created_at": "2026-03-10T11:02:00Z",
        "read_at": "2026-03-10T11:03:00Z"
      }
    ],
    "has_more": false,
    "next_cursor": null
  }
}
```

---

### 6.3 发送消息

**接口:** `POST /conversations/:conversation_id/messages`

**请求:**
```json
{
  "content": "你好！",
  "type": "text"  // text, image, voice
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "msg_objectid",
    "content": "你好！",
    "type": "text",
    "status": "sent",
    "created_at": "2026-03-10T12:00:00Z"
  }
}
```

---

### 6.4 消息已读

**接口:** `POST /conversations/:conversation_id/read`

**请求:**
```json
{
  "message_ids": ["msg_objectid_1", "msg_objectid_2"]
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success"
}
```

---

### 6.5 获取聊天建议 (AI)

**接口:** `POST /chat/ai/suggestions`

**请求:**
```json
{
  "conversation_id": "user1_user2",
  "last_messages": [
    { "sender": "partner", "content": "今天工作好累啊" }
  ],
  "partner_personality": "ENFP"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "suggestions": [
      "听起来你今天很辛苦，要不要聊聊发生了什么？",
      "辛苦了！工作之余也要记得放松一下哦~",
      "抱抱~ 要不要听听音乐或者散散步放松一下？"
    ],
    "emotion_detected": "疲惫",
    "recommended_tone": "关心、温暖"
  }
}
```

---

## 7. 会员功能模块

### 7.1 获取会员套餐

**接口:** `GET /subscriptions/plans`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "plans": [
      {
        "plan_id": "plan_monthly",
        "name": "月度会员",
        "price": 30.00,
        "currency": "CNY",
        "duration_days": 30,
        "features": [
          "无限次匹配",
          "查看谁喜欢了我",
          "AI 日记辅助无限次",
          "高级筛选"
        ],
        "popular": false
      },
      {
        "plan_id": "plan_yearly",
        "name": "年度会员",
        "price": 298.00,
        "currency": "CNY",
        "duration_days": 365,
        "features": [
          "无限次匹配",
          "查看谁喜欢了我",
          "AI 日记辅助无限次",
          "高级筛选",
          "专属客服",
          "生日特权"
        ],
        "popular": true,
        "save_percentage": 17
      }
    ]
  }
}
```

---

### 7.2 创建订阅订单

**接口:** `POST /subscriptions/order`

**请求:**
```json
{
  "plan_id": "plan_yearly",
  "payment_method": "wechat"  // wechat, alipay, apple_pay
}
```

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "order_uuid",
    "amount": 298.00,
    "currency": "CNY",
    "payment_info": {
      "wechat": {
        "prepay_id": "wx20160910152845228efd288",
        "package": "Sign=WXPay"
      }
    },
    "expires_in": 900  // 订单有效期（秒）
  }
}
```

---

### 7.3 查询订单状态

**接口:** `GET /subscriptions/order/:order_id`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "order_id": "order_uuid",
    "status": "paid",  // pending, paid, cancelled, refunded
    "amount": 298.00,
    "paid_at": "2026-03-10T10:00:00Z"
  }
}
```

---

### 7.4 获取会员状态

**接口:** `GET /subscriptions/me`

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "is_vip": true,
    "plan": {
      "plan_id": "plan_yearly",
      "name": "年度会员"
    },
    "start_date": "2026-03-10",
    "end_date": "2027-03-10",
    "auto_renew": true,
    "remaining_days": 365,
    "usage": {
      "ai_assist_used": 50,
      "ai_assist_limit": -1,  // -1 表示无限
      "matches_today": 10,
      "matches_limit": -1
    }
  }
}
```

---

### 7.5 取消自动续费

**接口:** `DELETE /subscriptions/auto-renew`

**响应:**
```json
{
  "code": 200,
  "message": "已取消自动续费，会员权益将持续到 2027-03-10"
}
```

---

## 8. 通用接口

### 8.1 上传文件

**接口:** `POST /upload`

**请求:** multipart/form-data

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | 文件 |
| type | string | avatar, diary_image, voice |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "https://oss.xinyu.app/uploads/xxx.jpg",
    "thumbnail": "https://oss.xinyu.app/uploads/xxx_thumb.jpg"
  }
}
```

---

### 8.2 获取验证码

**接口:** `GET /captcha/sms`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| type | string | 是 | register, login, reset_password |

**响应:**
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expire_in": 300
  }
}
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 40007 | 手机号格式错误 |
| 40008 | 发送过于频繁 |

---

### 8.3 检查更新

**接口:** `GET /app/version`

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 是 | ios, android |
| version | string | 是 | 当前版本号 |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "latest_version": "1.2.0",
    "force_update": false,
    "update_url": "https://apps.apple.com/app/xinyu",
    "release_notes": "1. 优化匹配算法\n2. 修复已知问题"
  }
}
```

---

## 9. WebSocket 实时通信

### 9.1 连接 WebSocket

**URL:** `wss://api.xinyu.app/ws`

**认证:** 连接时携带 Token
```
wss://api.xinyu.app/ws?token=<jwt_token>
```

### 9.2 客户端消息类型

**订阅会话:**
```json
{
  "type": "subscribe",
  "conversation_id": "user1_user2"
}
```

**发送消息:**
```json
{
  "type": "message",
  "conversation_id": "user1_user2",
  "content": "你好！",
  "msg_type": "text"
}
```

**已读回执:**
```json
{
  "type": "read",
  "conversation_id": "user1_user2",
  "message_ids": ["msg_id_1", "msg_id_2"]
}
```

### 9.3 服务端推送类型

**新消息:**
```json
{
  "type": "message",
  "data": {
    "id": "msg_objectid",
    "conversation_id": "user1_user2",
    "sender_id": "user_uuid",
    "content": "你好！",
    "type": "text",
    "created_at": "2026-03-10T12:00:00Z"
  }
}
```

**匹配成功:**
```json
{
  "type": "match_success",
  "data": {
    "match_id": "match_uuid",
    "user": {
      "user_id": "user_uuid",
      "username": "lisi",
      "avatar_url": "..."
    }
  }
}
```

**在线状态:**
```json
{
  "type": "presence",
  "data": {
    "user_id": "user_uuid",
    "online": true,
    "last_seen": "2026-03-10T12:00:00Z"
  }
}
```

---

## 10. 错误码定义

### 10.1 通用错误码

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证或 Token 过期 |
| 403 | 403 | 无权限访问 |
| 404 | 404 | 资源不存在 |
| 429 | 429 | 请求过于频繁 |
| 500 | 500 | 服务器内部错误 |
| 503 | 503 | 服务暂时不可用 |

### 10.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| 10001 | 用户未注册 |
| 10002 | 密码错误 |
| 10003 | 账号已被禁用 |
| 20001 | 测试未完成，无法查看报告 |
| 20002 | 测试已过期 |
| 30001 | 日记不存在 |
| 30002 | 无权限查看该日记 |
| 40001 | 匹配请求已存在 |
| 40002 | 无法匹配自己 |
| 50001 | 订单创建失败 |
| 50002 | 支付超时 |
| 60001 | AI 服务暂时不可用 |
| 60002 | AI 调用失败 |

---

## 11. 限流策略

| 接口类型 | 限流规则 | 说明 |
|---------|---------|------|
| 普通接口 | 100 次/分钟/IP | 大部分查询接口 |
| 认证接口 | 10 次/分钟/IP | 登录、注册、验证码 |
| AI 接口 | 30 次/分钟/用户 | 日记辅助、聊天建议 |
| 上传接口 | 20 次/分钟/用户 | 图片、文件上传 |
| 消息发送 | 60 次/分钟/用户 | 聊天消息 |

---

## 12. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0 | 2026-03-10 | 初始版本，包含核心功能 API |

---

## 13. OpenAPI/Swagger

完整的 OpenAPI 3.0 规范文件位于：
- `src/backend/docs/openapi.yaml`
- 在线文档：`https://api.xinyu.app/docs`

---

**文档状态：** ✅ 已完成  
**维护者：** Backend Architect + API Tester  
**下次更新：** 功能迭代时同步更新
