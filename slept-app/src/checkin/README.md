# Checkin Module - 睡了么 App

打卡功能 API 模块，用于记录用户的睡前和起床打卡。

## API Endpoints

### 1. 睡前打卡
```
POST /api/checkin/bedtime
```

**Request Body:**
```json
{
  "userId": "user123",
  "timestamp": "2026-03-07T22:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "streakDays": 5
}
```

---

### 2. 起床打卡
```
POST /api/checkin/wakeup
```

**Request Body:**
```json
{
  "userId": "user123",
  "timestamp": "2026-03-08T07:00:00Z",
  "quality": 4
}
```

**Response:**
```json
{
  "success": true,
  "sleepDuration": 30600000
}
```

---

### 3. 查询打卡记录
```
GET /api/checkin/records?userId=user123&date=2026-03-07
```

**Query Parameters:**
- `userId` (required): 用户 ID
- `date` (optional): 指定日期 (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 1,
    "type": "bedtime",
    "timestamp": "2026-03-07T22:30:00Z",
    "quality": null,
    "createdAt": "2026-03-07T22:30:00Z"
  },
  {
    "id": 2,
    "type": "wakeup",
    "timestamp": "2026-03-08T07:00:00Z",
    "quality": 4,
    "createdAt": "2026-03-08T07:00:00Z"
  }
]
```

---

### 4. 查询打卡统计
```
GET /api/checkin/stats?userId=user123
```

**Query Parameters:**
- `userId` (required): 用户 ID

**Response:**
```json
{
  "avgBedtime": "22:30",
  "avgWakeup": "07:00",
  "streakDays": 5,
  "score": 85
}
```

---

## 数据库表结构

### checkins 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| userId | VARCHAR | 用户 ID (索引) |
| type | VARCHAR | 类型：bedtime/wakeup |
| timestamp | TIMESTAMP | 打卡时间 |
| quality | INTEGER | 质量评分 1-5 (仅起床) |
| createdAt | TIMESTAMP | 创建时间 |

### sleep_records 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| userId | VARCHAR | 用户 ID (索引) |
| bedtime | TIMESTAMP | 入睡时间 |
| wakeupTime | TIMESTAMP | 起床时间 |
| duration | BIGINT | 睡眠时长 (毫秒) |
| quality | INTEGER | 质量评分 1-5 |
| createdAt | TIMESTAMP | 创建时间 |

---

## 使用说明

1. 在 `app.module.ts` 中导入模块:
```typescript
import { CheckinModule } from './checkin';

@Module({
  imports: [CheckinModule],
})
export class AppModule {}
```

2. 确保 TypeORM 已配置并连接到数据库

3. 运行数据库迁移:
```bash
# 如果使用 SQL 文件
psql -d your_database < src/checkin/checkin.sql

# 或使用 TypeORM migrations
npm run typeorm migration:run
```
