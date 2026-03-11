/**
 * 限流中间件
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');
const { getRedisClient } = require('../models/db');
const logger = require('../utils/logger');

// Redis Store 配置
const createRedisStore = () => {
  const RedisStore = require('rate-limit-redis').default;
  return new RedisStore({
    sendCommand: (...args) => getRedisClient().call(...args),
  });
};

// 通用限流器
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '请求过于频繁，请稍后重试',
  },
  handler: (req, res) => {
    logger.warn(`限流触发：${req.ip} ${req.path}`);
    res.status(429).json({
      code: 429,
      message: '请求过于频繁，请稍后重试',
    });
  },
});

// 认证接口限流器（更严格）
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 10 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '操作过于频繁，请稍后重试',
  },
});

// AI 接口限流器
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 30, // 30 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: 'AI 请求过于频繁，请稍后重试',
  },
});

// 上传接口限流器
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 20, // 20 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '上传过于频繁，请稍后重试',
  },
});

module.exports = {
  rateLimiter: generalLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
};
