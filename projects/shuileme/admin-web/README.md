# 睡了么 Admin - 管理后台

基于 React + Vite 的 Web 管理后台，用于用户管理、数据分析、内容运营。

## 技术栈

- **框架:** React 18
- **构建:** Vite
- **语言:** TypeScript
- **UI:** 自定义组件
- **状态管理:** Zustand

## 功能模块

| 模块 | 说明 |
|------|------|
| Dashboard | 数据概览 |
| 用户管理 | 用户列表、详情、封禁 |
| 管理员 | 管理员账号管理 |
| 内容审核 | UGC 内容审核 |
| 数据统计 | 运营数据分析 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── pages/          # 页面
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Admins.tsx
│   └── Login.tsx
├── components/     # 组件
│   └── Layout.tsx
├── api/            # API 调用
└── store/          # 状态管理
    └── authStore.ts
```

## 部署

```bash
# 构建
npm run build

# 部署 dist/ 到 Nginx 或其他静态服务器
```

---

**访问地址:** http://localhost:5173 (开发)  
**API 地址:** http://localhost:3000
