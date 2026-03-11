# 心语 App 开发启动指南

**版本:** 1.0  
**日期:** 2026-03-10

---

## 🚀 快速启动

### 1. 环境准备

确保已安装以下软件:
- Node.js >= 20
- Docker & Docker Compose
- Git

### 2. 启动数据库服务

```bash
cd /home/admin/.openclaw/workspace-secretary/projects/xinyu-tech/docker

# 启动 PostgreSQL, MongoDB, Redis
docker-compose up -d
```

### 3. 配置后端

```bash
cd /home/admin/.openclaw/workspace-secretary/projects/xinyu-tech/src/backend

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 配置数据库连接等
# 使用默认配置可直接启动（Docker 环境）
```

### 4. 安装依赖并启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000/health` 验证服务是否正常。

---

## 📁 项目结构

```
xinyu-tech/
├── docs/                      # 设计文档
│   ├── 技术架构设计.md        # ✅ 已完成
│   ├── 数据库设计文档.md      # ✅ 已完成
│   └── API 文档.md            # ✅ 已完成
├── src/
│   ├── backend/              # 后端服务
│   │   ├── src/
│   │   │   ├── controllers/  # 控制器 (8 个)
│   │   │   ├── routes/       # 路由 (8 个)
│   │   │   ├── middleware/   # 中间件 (3 个)
│   │   │   ├── models/       # 数据库模型
│   │   │   ├── utils/        # 工具函数
│   │   │   └── index.js      # 入口文件
│   │   ├── package.json
│   │   └── .env.example
│   ├── mobile/               # 移动 App (待开发)
│   └── ai/                   # AI 服务 (待开发)
├── docker/
│   └── docker-compose.yml    # Docker 配置
├── README.md
└── PROJECT_STATUS.md         # 项目状态
```

---

## 🔧 开发指南

### 添加新接口

1. 在 `routes/` 创建路由文件
2. 在 `controllers/` 创建控制器
3. 在 `index.js` 注册路由

### 数据库操作

```javascript
const { pgPool } = require('../models/db');

// PostgreSQL 查询
const result = await pgPool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// MongoDB 操作
const Diary = mongoose.model('Diary', diarySchema);
const diaries = await Diary.find({ user_id: userId });

// Redis 操作
const { getRedisClient } = require('../models/db');
const redis = getRedisClient();
await redis.setex('key', 300, 'value');
```

### 错误处理

```javascript
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// 使用 asyncHandler 包装异步函数
router.get('/users', asyncHandler(userController.getUsers));

// 抛出自定义错误
throw new AppError('用户不存在', 404, 404);
```

---

## 📚 API 测试

### 使用 Postman

导入 API 文档中的接口示例，配置环境变量:
- `baseUrl`: `http://localhost:3000/api/v1`
- `token`: 登录后获取的 access_token

### 使用 cURL

```bash
# 注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'

# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"test@example.com","password":"Test123!"}'

# 获取用户信息 (需要 token)
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

---

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

---

## 📦 部署

### 开发环境

```bash
docker-compose up -d
```

### 生产环境

1. 配置阿里云 ECS
2. 修改 `.env` 生产配置
3. 构建 Docker 镜像
4. 部署到阿里云

详细部署流程见 `docs/技术架构设计.md` 第 7 章。

---

## 🔐 安全注意事项

1. **生产环境必须修改**:
   - JWT_SECRET
   - 数据库密码
   - API 密钥

2. **启用 HTTPS**:
   - 配置 SSL 证书
   - 强制 HTTPS 重定向

3. **定期更新依赖**:
   ```bash
   npm audit
   npm update
   ```

---

## 📞 支持

- **技术文档:** `docs/` 目录
- **项目状态:** `PROJECT_STATUS.md`
- **问题反馈:** GitHub Issues

---

**祝开发顺利!** 🎉
