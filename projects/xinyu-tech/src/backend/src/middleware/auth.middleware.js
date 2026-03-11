/**
 * 认证中间件
 * @module middleware/auth.middleware
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { getRedisClient } = require('../models/db');
const logger = require('../utils/logger');

/**
 * JWT 认证中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从 Header 获取 Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 401, 401);
    }

    const token = authHeader.split(' ')[1];

    // 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'access') {
      throw new AppError('令牌类型错误', 401, 401);
    }

    // 检查 Token 是否在黑名单中
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`token:blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('令牌已失效', 401, 401);
    }

    // 尝试从缓存获取用户信息
    const cachedUser = await redis.get(`cache:user:${decoded.userId}`);
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
    } else {
      req.user = { id: decoded.userId };
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('认证令牌无效或已过期', 401, 401));
    } else {
      next(error);
    }
  }
};

/**
 * 可选认证中间件
 * Token 存在则验证，不存在则跳过
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
    }
    next();
  } catch (error) {
    // Token 无效时忽略，继续执行
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
