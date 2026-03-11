# 睡了么 - 用户反馈系统

完整的用户反馈系统，包含前端提交页面、后端 API 和管理后台。

## 📁 项目结构

```
feedback-system/
├── backend/                 # 后端服务
│   ├── server.js           # 主服务器入口
│   ├── package.json        # 依赖配置
│   ├── .env.example        # 环境变量示例
│   ├── models/             # 数据模型
│   │   ├── Feedback.js     # 反馈模型
│   │   └── Admin.js        # 管理员模型
│   ├── routes/             # API 路由
│   │   ├── feedback.js     # 反馈相关接口
│   │   └── auth.js         # 认证接口
│   ├── middleware/         # 中间件
│   │   ├── auth.js         # JWT 认证
│   │   └── upload.js       # 文件上传
│   └── uploads/            # 上传文件存储
│       └── screenshots/    # 截图目录
│
├── frontend/               # 前端用户反馈页面
│   └── index.html         # 反馈提交表单
│
└── admin/                  # 管理后台
    └── index.html         # 管理界面
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置 MongoDB 连接等信息
```

### 3. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. 启动后端服务

```bash
cd backend
npm start
# 或开发模式
npm run dev
```

服务将运行在 `http://localhost:3000`

### 5. 访问页面

- **用户反馈页面**: 直接在浏览器打开 `frontend/index.html`
- **管理后台**: 直接在浏览器打开 `admin/index.html`
  - 默认管理员账号：`admin` / `admin123`
  - ⚠️ 首次登录后请立即修改密码

## 📡 API 接口

### 用户端接口

#### 提交反馈
```
POST /api/feedback/submit
Content-Type: multipart/form-data

参数:
- type: 反馈类型 (bug|suggestion|other) [必填]
- content: 反馈内容 [必填]
- contact: 联系方式 [可选]
- screenshots: 截图文件数组 [可选，最多 5 张]
- deviceId: 设备 ID [可选]
- appVersion: App 版本 [可选]
- os: 操作系统 [可选]
- osVersion: 系统版本 [可选]
```

### 管理员接口

需要 Bearer Token 认证。

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

响应:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "admin": {
      "id": "...",
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

#### 获取反馈列表
```
GET /api/feedback/list?page=1&limit=20&type=bug&status=pending&keyword=搜索词
Authorization: Bearer <token>
```

#### 获取反馈详情
```
GET /api/feedback/:id
Authorization: Bearer <token>
```

#### 更新反馈状态
```
PATCH /api/feedback/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing",
  "adminNote": "正在处理..."
}
```

#### 导出数据
```
GET /api/feedback/export?type=bug&status=resolved
Authorization: Bearer <token>

返回 Excel 文件下载
```

#### 获取统计数据
```
GET /api/feedback/stats
Authorization: Bearer <token>
```

## 🎨 功能特性

### 前端反馈页面
- ✅ 响应式设计，适配移动端
- ✅ 反馈类型选择（Bug/建议/其他）
- ✅ 截图上传（拖拽/点击，最多 5 张）
- ✅ 联系方式（可选）
- ✅ 设备信息自动采集
- ✅ 提交成功提示

### 后端 API
- ✅ RESTful API 设计
- ✅ JWT 认证
- ✅ 文件上传处理
- ✅ 数据验证
- ✅ 分页查询
- ✅ 多条件筛选
- ✅ Excel 导出
- ✅ 统计数据

### 管理后台
- ✅ 管理员登录
- ✅ 反馈列表展示
- ✅ 多条件筛选
- ✅ 反馈详情查看
- ✅ 状态更新
- ✅ 处理备注
- ✅ 数据导出
- ✅ 统计面板

## 🔒 安全建议

1. **生产环境配置**
   - 修改 `JWT_SECRET` 为强随机字符串
   - 修改默认管理员密码
   - 启用 HTTPS
   - 配置 CORS 白名单

2. **MongoDB 安全**
   - 启用认证
   - 限制访问 IP
   - 定期备份数据

3. **文件上传**
   - 已限制文件类型（仅图片）
   - 已限制文件大小（5MB）
   - 已限制数量（5 张）

## 🛠️ 技术栈

- **后端**: Node.js + Express
- **数据库**: MongoDB + Mongoose
- **认证**: JWT
- **文件上传**: Multer
- **Excel 导出**: ExcelJS
- **前端**: 原生 HTML/CSS/JavaScript
- **UI**: 自定义现代风格

## 📝 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3000 |
| MONGODB_URI | MongoDB 连接字符串 | mongodb://localhost:27017/shuileme-feedback |
| JWT_SECRET | JWT 密钥 | shuileme-feedback-secret-key |
| NODE_ENV | 环境 | development |

## 🐛 常见问题

### MongoDB 连接失败
确保 MongoDB 服务正在运行，检查 `MONGODB_URI` 配置。

### 文件上传失败
检查 `uploads` 目录是否有写权限。

### 跨域问题
开发环境下已启用 CORS，生产环境请配置允许的域名。

## 📄 许可证

MIT License

---

**睡了么** - 让反馈更简单 🌙
