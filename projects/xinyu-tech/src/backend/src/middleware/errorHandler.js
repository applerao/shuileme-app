/**
 * 错误处理中间件
 * @module middleware/errorHandler
 */

const logger = require('../utils/logger');

/**
 * 统一错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error('错误:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 默认错误响应
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 500;
  let message = err.message || '服务器内部错误';
  let errors = err.errors || null;

  // 处理常见错误类型
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 401;
    message = '认证失败';
  }

  if (err.code === '23505') {
    // PostgreSQL 唯一约束冲突
    statusCode = 409;
    errorCode = 409;
    message = '资源已存在';
  }

  if (err.code === '23503') {
    // PostgreSQL 外键约束冲突
    statusCode = 400;
    errorCode = 400;
    message = '关联资源不存在';
  }

  // 发送错误响应
  res.status(statusCode).json({
    code: errorCode,
    message,
    errors,
    timestamp: Date.now(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 异步处理器包装器
 * 避免在 async 路由处理器中重复 try-catch
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
};
