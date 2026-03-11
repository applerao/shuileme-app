/**
 * 认证控制器
 * @module controllers/auth.controller
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const { pgPool, getRedisClient } = require('../models/db');
const logger = require('../utils/logger');

/**
 * 用户注册
 */
const register = async (req, res) => {
  const { username, email, password, phone, verifyCode } = req.body;

  // TODO: 验证验证码

  // 检查用户名是否已存在
  const usernameCheck = await pgPool.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  if (usernameCheck.rows.length > 0) {
    throw new AppError('用户名已存在', 40001, 400);
  }

  // 检查邮箱是否已注册
  const emailCheck = await pgPool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (emailCheck.rows.length > 0) {
    throw new AppError('邮箱已注册', 40002, 400);
  }

  // 密码加密
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 创建用户
  const result = await pgPool.query(
    `INSERT INTO users (id, username, email, password_hash, phone, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, username, email, avatar_url, created_at`,
    [uuidv4(), username, email, passwordHash, phone, 1]
  );

  const user = result.rows[0];

  // 生成 Token
  const tokens = generateTokens(user.id);

  // 缓存用户信息
  await cacheUserInfo(user.id, user);

  logger.info(`用户注册成功：${username}`);

  res.status(200).json({
    code: 200,
    message: '注册成功',
    data: {
      user,
      token: tokens,
    },
  });
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  const { account, password, device_id } = req.body;

  // 查找用户（支持邮箱、用户名、手机号登录）
  let user;
  if (account.includes('@')) {
    // 邮箱登录
    const result = await pgPool.query(
      'SELECT * FROM users WHERE email = $1',
      [account]
    );
    user = result.rows[0];
  } else if (/^\d{11}$/.test(account)) {
    // 手机号登录
    const result = await pgPool.query(
      'SELECT * FROM users WHERE phone = $1',
      [account]
    );
    user = result.rows[0];
  } else {
    // 用户名登录
    const result = await pgPool.query(
      'SELECT * FROM users WHERE username = $1',
      [account]
    );
    user = result.rows[0];
  }

  if (!user) {
    throw new AppError('账号或密码错误', 40101, 401);
  }

  // 检查账号状态
  if (user.status === 0) {
    throw new AppError('账号已被禁用', 40102, 403);
  }

  // 验证密码
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('账号或密码错误', 40101, 401);
  }

  // 更新最后登录时间
  await pgPool.query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  // 生成 Token
  const tokens = generateTokens(user.id);

  // 准备返回的用户信息（脱敏）
  const userInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    personality_type: user.personality_type,
    is_vip: false, // TODO: 从订阅表查询
  };

  // 缓存用户信息
  await cacheUserInfo(user.id, userInfo);

  logger.info(`用户登录成功：${user.username}`);

  res.status(200).json({
    code: 200,
    message: '登录成功',
    data: {
      user: userInfo,
      token: tokens,
    },
  });
};

/**
 * 用户登出
 */
const logout = async (req, res) => {
  // TODO: 将 token 加入黑名单
  const userId = req.user?.id;
  
  if (userId) {
    await getRedisClient().del(`session:${userId}`);
  }

  res.status(200).json({
    code: 200,
    message: '登出成功',
  });
};

/**
 * 刷新 Token
 */
const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError('缺少 refresh_token', 400, 400);
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    
    // 生成新的 token 对
    const tokens = generateTokens(decoded.userId);

    res.status(200).json({
      code: 200,
      message: 'success',
      data: tokens,
    });
  } catch (error) {
    throw new AppError('refresh_token 无效或已过期', 401, 401);
  }
};

/**
 * 获取短信验证码
 */
const getSmsCode = async (req, res) => {
  const { phone, type } = req.query;

  // 验证手机号格式
  if (!/^\d{11}$/.test(phone)) {
    throw new AppError('手机号格式错误', 40007, 400);
  }

  // TODO: 发送短信验证码
  // TODO: 存储验证码到 Redis，5 分钟过期

  res.status(200).json({
    code: 200,
    message: '验证码已发送',
    data: {
      expire_in: 300,
    },
  });
};

/**
 * 生成 JWT Token
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 7 * 24 * 60 * 60, // 7 天（秒）
  };
};

/**
 * 缓存用户信息到 Redis
 */
const cacheUserInfo = async (userId, userInfo) => {
  try {
    const redis = getRedisClient();
    const key = `cache:user:${userId}`;
    await redis.setex(key, 1800, JSON.stringify(userInfo)); // 30 分钟
  } catch (error) {
    logger.error('缓存用户信息失败:', error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getSmsCode,
};
