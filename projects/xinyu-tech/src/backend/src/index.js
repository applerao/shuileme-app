/**
 * 心语 App 后端服务入口
 * @module index
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

const { connectPostgreSQL, connectMongoDB, connectRedis } = require('./models/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// 导入路由
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const testRoutes = require('./routes/test.routes');
const diaryRoutes = require('./routes/diary.routes');
const matchRoutes = require('./routes/match.routes');
const chatRoutes = require('./routes/chat.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const uploadRoutes = require('./routes/upload.routes');

// 创建 Express 应用
const app = express();
const server = http.createServer(app);

// WebSocket 初始化
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(helmet()); // 安全头
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression()); // Gzip 压缩
app.use(morgan('combined', { stream: logger.stream })); // 日志
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流
app.use(rateLimiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 路由
const apiVersion = process.env.API_VERSION || 'v1';
const apiPrefix = `/api/${apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/tests`, testRoutes);
app.use(`${apiPrefix}/diaries`, diaryRoutes);
app.use(`${apiPrefix}/matches`, matchRoutes);
app.use(`${apiPrefix}/conversations`, chatRoutes);
app.use(`${apiPrefix}/subscriptions`, subscriptionRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    path: req.path
  });
});

// 错误处理
app.use(errorHandler);

// WebSocket 连接处理
io.on('connection', (socket) => {
  logger.info(`WebSocket 连接：${socket.id}`);
  
  // 认证
  socket.on('authenticate', async (token) => {
    try {
      // TODO: 验证 token
      socket.emit('authenticated', { success: true });
    } catch (error) {
      socket.emit('authenticated', { success: false, error: '认证失败' });
    }
  });
  
  // 加入会话房间
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    logger.info(`用户 ${socket.id} 加入会话 ${conversationId}`);
  });
  
  // 发送消息
  socket.on('send_message', async (data) => {
    // TODO: 保存消息到数据库
    // 广播给会话中的其他用户
    socket.to(`conversation:${data.conversationId}`).emit('new_message', data);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    logger.info(`WebSocket 断开：${socket.id}`);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 连接数据库
    await connectPostgreSQL();
    await connectMongoDB();
    await connectRedis();
    
    logger.info('数据库连接成功');
    
    // 启动 HTTP 服务器
    server.listen(PORT, () => {
      logger.info(`服务器启动在端口 ${PORT}`);
      logger.info(`环境：${process.env.NODE_ENV}`);
      logger.info(`API 版本：${apiVersion}`);
    });
    
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

module.exports = { app, io, server };
