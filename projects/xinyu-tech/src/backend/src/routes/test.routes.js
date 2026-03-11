/**
 * 性格测试路由模块
 * @module routes/test.routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const testController = require('../controllers/test.controller');

// 获取题目不需要认证
/**
 * @route GET /tests/questions
 * @desc 获取测试题目
 * @access Public
 */
router.get('/questions', asyncHandler(testController.getQuestions));

// 其他接口需要认证
router.use(authMiddleware);

/**
 * @route POST /tests/submit
 * @desc 提交测试结果
 * @access Private
 */
router.post('/submit', asyncHandler(testController.submitTest));

/**
 * @route GET /tests/history
 * @desc 获取测试历史
 * @access Private
 */
router.get('/history', asyncHandler(testController.getHistory));

/**
 * @route GET /tests/report/:id
 * @desc 获取测试报告
 * @access Private
 */
router.get('/report/:id', asyncHandler(testController.getReport));

module.exports = router;
