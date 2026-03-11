/**
 * 用户路由模块
 * @module routes/user.routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// 所有用户路由都需要认证
router.use(authMiddleware);

/**
 * @route GET /users/me
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/me', asyncHandler(userController.getMe));

/**
 * @route PUT /users/me
 * @desc 更新用户信息
 * @access Private
 */
router.put('/me', asyncHandler(userController.updateMe));

/**
 * @route PUT /users/me/password
 * @desc 修改密码
 * @access Private
 */
router.put('/me/password', asyncHandler(userController.updatePassword));

/**
 * @route GET /users/:id
 * @desc 获取用户公开信息
 * @access Private
 */
router.get('/:id', asyncHandler(userController.getUserById));

module.exports = router;
