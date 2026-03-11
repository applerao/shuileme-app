require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Admin = require('./models/Admin');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（截图）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
const feedbackRoutes = require('./routes/feedback');
const authRoutes = require('./routes/auth');

app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 连接数据库并启动服务器
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shuileme-feedback';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB 连接成功');
    
    // 创建默认超级管理员（如果不存在）
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const superAdmin = new Admin({
        username: 'admin',
        password: 'admin123', // 首次登录后请修改
        role: 'super_admin'
      });
      await superAdmin.save();
      console.log('✅ 默认超级管理员已创建 (用户名：admin, 密码：admin123)');
    }
    
    app.listen(PORT, () => {
      console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
      console.log(`📝 环境：${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB 连接失败:', err);
    process.exit(1);
  });

module.exports = app;
