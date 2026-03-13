# 睡了么 API - 数据库配置说明

## 双数据库模式支持

项目现在支持 **SQLite** 和 **PostgreSQL** 两种数据库模式，**默认使用 SQLite**。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式启动（使用 SQLite）
npm run start:dev
```

## 配置方式

通过环境变量 `DB_TYPE` 切换数据库模式：

### SQLite 模式（默认）

```bash
DB_TYPE=sqlite
DB_SQLITE_PATH=./data/shuileme.db
```

SQLite 数据库文件会自动创建在项目根目录的 `data/` 文件夹下。

### PostgreSQL 模式

```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shuileme
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## 环境变量配置

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

## 完整环境变量列表

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务器端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` |
| `DB_TYPE` | 数据库类型 | `sqlite` |
| `DB_SQLITE_PATH` | SQLite 数据库路径 | `./data/shuileme.db` |
| `DB_HOST` | PostgreSQL 主机 | `localhost` |
| `DB_PORT` | PostgreSQL 端口 | `5432` |
| `DB_NAME` | PostgreSQL 数据库名 | `shuileme` |
| `DB_USERNAME` | PostgreSQL 用户名 | `postgres` |
| `DB_PASSWORD` | PostgreSQL 密码 | `postgres` |
| `DB_SYNCHRONIZE` | 自动同步表结构（仅开发） | `true` |
| `JWT_SECRET` | JWT 密钥 | - |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |

## 数据库迁移

### SQLite 模式

开发模式下 `DB_SYNCHRONIZE=true` 会自动同步表结构。

生产环境建议使用迁移：

```bash
# 生成迁移
npm run migration:generate -- src/migrations/InitialMigration

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

### PostgreSQL 模式

配置 PostgreSQL 后，使用相同的迁移命令。

## 注意事项

1. **SQLite 模式** 适合开发、测试和小规模部署
2. **PostgreSQL 模式** 适合生产环境和高并发场景
3. 切换数据库模式后需要重启服务
4. SQLite 模式下会自动创建 `data/` 目录
5. TypeORM 会自动使用 `better-sqlite3` 驱动

## 技术栈

- **框架:** NestJS
- **ORM:** TypeORM 0.3.x
- **SQLite 驱动:** better-sqlite3 11.x
- **PostgreSQL 驱动:** pg 8.x

---

**更新日期:** 2026-03-12
