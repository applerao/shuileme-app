/**
 * 认证路由模块
 * @module routes/auth.routes
 */

const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const authController = require('../controllers/auth.controller');

/**
 * @route POST /auth/register
 * @desc 用户注册
 * @access Public
 */
router.post(
  '/register',
  authLimiter,
  asyncHandler(authController.register)
);

/**
 * @route POST /auth/login
 * @desc 用户登录
 * @access Public
 */
router.post(
  '/login',
  authLimiter,
  asyncHandler(authController.login)
);

/**
 * @route POST /auth/logout
 * @desc 用户登出
 * @access Private
 */
router.post(
  '/logout',
  asyncHandler(authController.logout)
);

/**
 * @route POST /auth/refresh
 * @desc 刷新 Token
 * @access Public
 */
router.post(
  '/refresh',
  asyncHandler(authController.refreshToken)
);

/**
 * @route GET /auth/sms
 * @desc 获取短信验证码
 * @access Public
 */
router.get(
  '/sms',
  authLimiter,
  asyncHandler(authController.getSmsCode)
);

module.exports = router;
