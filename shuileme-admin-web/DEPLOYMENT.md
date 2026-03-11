# 睡了么 Admin Dashboard - 部署指南

## 🚀 部署流程

### 1. 生产构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建产物在 dist/ 目录
```

### 2. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name admin.shuileme.com;
    
    root /var/www/shuileme-admin/dist;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Docker 部署

**Dockerfile**:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  admin:
    build: .
    ports:
      - "80:80"
    environment:
      - API_BASE_URL=http://api.shuileme.com
    restart: unless-stopped
```

### 4. 环境变量配置

生产环境建议配置：

```env
VITE_API_BASE_URL=https://api.shuileme.com/api/v1/admin
```

---

## 🔒 安全建议

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **Token 安全**: 考虑使用 httpOnly cookie 存储 token
3. **CSP**: 配置 Content-Security-Policy 头部
4. **速率限制**: API 接口添加速率限制
5. **日志监控**: 记录所有管理操作日志

---

## 📊 监控与日志

### 关键指标

- 页面加载时间 (< 2s)
- API 响应时间 (< 500ms)
- 错误率 (< 0.1%)
- 活跃管理员数

### 日志记录

建议记录：
- 登录/登出操作
- 数据修改操作
- 权限变更操作
- 异常错误

---

## 🔄 更新流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖（如有更新）
npm install

# 3. 构建
npm run build

# 4. 重启服务（根据部署方式）
# Nginx: 自动生效
# Docker: docker-compose restart
```

---

## 📞 运维联系

- 技术支持：开发团队
- 紧急联系：[内部联系方式]
