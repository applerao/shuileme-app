# 睡了么 Admin Dashboard - 后台配置文档

## 📋 项目概述

**睡了么** 数据分析后台管理系统，用于管理用户数据、查看统计报表、配置系统参数。

- **技术栈**: React 18 + TypeScript + Ant Design 5 + Vite
- **状态管理**: Zustand
- **图表库**: Recharts
- **路由**: React Router v6

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
cd shuileme-admin-web
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173`

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

---

## 📁 项目结构

```
shuileme-admin-web/
├── src/
│   ├── api/              # API 接口定义
│   │   └── index.ts
│   ├── components/       # 公共组件
│   │   └── Layout.tsx    # 布局组件
│   ├── pages/            # 页面组件
│   │   ├── Login.tsx     # 登录页
│   │   ├── Dashboard.tsx # 数据看板
│   │   ├── Users.tsx     # 用户管理
│   │   └── Admins.tsx    # 管理员管理
│   ├── store/            # 状态管理
│   │   └── authStore.ts  # 认证状态
│   ├── App.tsx           # 应用入口
│   ├── main.tsx          # React 入口
│   └── index.css         # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 认证与授权

### 登录方式

- 默认账号：`admin` / `admin123`
- JWT Token 认证
- Token 存储在 localStorage 中

### 角色权限

| 角色 | 权限说明 |
|------|----------|
| 超级管理员 (super_admin) | 全部权限 |
| 管理员 (admin) | 用户管理、数据查看、内容管理 |
| 运营专员 (operator) | 用户查看、数据查看 |

---

## 📊 功能模块

### 1. 数据看板 (Dashboard)

**路由**: `/`

**功能**:
- 核心指标展示（总用户数、活跃用户、今日打卡、平均睡眠时长）
- 用户增长趋势图（折线图）
- 打卡趋势图（柱状图）
- 睡眠质量分布图（饼图）
- 最近注册用户列表

**API 接口**:
- `GET /api/v1/admin/dashboard` - 获取看板数据
- `GET /api/v1/admin/stats/users` - 用户统计
- `GET /api/v1/admin/stats/activity` - 活跃度统计
- `GET /api/v1/admin/stats/sleep` - 睡眠统计
- `GET /api/v1/admin/stats/checkin-rate` - 打卡率统计

---

### 2. 用户管理 (Users)

**路由**: `/users`

**功能**:
- 用户列表展示（支持分页）
- 搜索（用户名/手机号）
- 状态筛选（活跃/未激活/已封禁）
- 用户详情查看
- 用户状态修改
- 用户删除
- 数据导出

**API 接口**:
- `GET /api/v1/admin/users` - 获取用户列表
- `GET /api/v1/admin/users/:id` - 获取用户详情
- `PUT /api/v1/admin/users/:id/status` - 修改用户状态
- `DELETE /api/v1/admin/users/:id` - 删除用户

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| username | string | 用户名 |
| phone | string | 手机号 |
| email | string | 邮箱 |
| gender | string | 性别 |
| age | number | 年龄 |
| registerTime | string | 注册时间 |
| lastLoginTime | string | 最后登录时间 |
| status | string | 状态 (active/inactive/banned) |
| totalCheckins | number | 总打卡次数 |
| avgSleepTime | number | 平均睡眠时长 |

---

### 3. 管理员管理 (Admins)

**路由**: `/admins`

**功能**:
- 管理员列表展示
- 角色管理（超级管理员/管理员/运营专员）
- 权限配置
- 状态切换（启用/禁用）
- 新增/编辑/删除管理员

**API 接口**:
- `GET /api/v1/admin/admins` - 获取管理员列表
- `POST /api/v1/admin/admins` - 创建管理员
- `PUT /api/v1/admin/admins/:id` - 更新管理员
- `DELETE /api/v1/admin/admins/:id` - 删除管理员

**权限列表**:
- `user_view` - 用户查看
- `user_manage` - 用户管理
- `data_view` - 数据查看
- `content_manage` - 内容管理
- `admin_manage` - 管理员管理
- `all` - 全部权限

---

## 🔧 配置说明

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=/api/v1/admin
```

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

---

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/components/Layout.tsx` 添加菜单项

### 添加新 API

在 `src/api/index.ts` 中添加：

```typescript
export const newApi = {
  getList: (params: any) => api.get('/new-endpoint', { params }),
  create: (data: any) => api.post('/new-endpoint', data),
};
```

### 添加新图表

使用 Recharts 组件：

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="#1890ff" />
  </LineChart>
</ResponsiveContainer>
```

---

## 📝 注意事项

1. **Token 安全**: Token 存储在 localStorage，注意 XSS 防护
2. **API 错误处理**: 所有 API 调用都有错误拦截，401 会自动跳转登录
3. **权限控制**: 前端路由有基础保护，但权限验证应在后端完成
4. **数据导出**: 导出功能需后端配合生成文件

---

## 🐛 常见问题

### Q: 登录成功后仍跳转回登录页？
A: 检查后端返回的 token 格式是否正确，确认 localStorage 中已存储 `admin_token`

### Q: 图表不显示？
A: 确保父容器有明确的高度，Recharts 需要容器高度才能渲染

### Q: 跨域问题？
A: 在 vite.config.ts 中配置 proxy，或后端配置 CORS

---

## 📞 技术支持

- 项目仓库：[内部仓库]
- 文档维护：开发团队
- 最后更新：2026-03-07

---

## 📄 许可证

内部项目，仅供公司内部使用。
