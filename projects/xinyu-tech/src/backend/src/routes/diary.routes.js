/**
 * 日记路由模块
 * @module routes/diary.routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler, aiLimiter } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const diaryController = require('../controllers/diary.controller');

// 所有日记路由都需要认证
router.use(authMiddleware);

/**
 * @route GET /diaries
 * @desc 获取日记列表
 * @access Private
 */
router.get('/', asyncHandler(diaryController.getList));

/**
 * @route POST /diaries
 * @desc 发布日记
 * @access Private
 */
router.post('/', asyncHandler(diaryController.create));

/**
 * @route GET /diaries/:id
 * @desc 获取日记详情
 * @access Private
 */
router.get('/:id', asyncHandler(diaryController.getById));

/**
 * @route PUT /diaries/:id
 * @desc 更新日记
 * @access Private
 */
router.put('/:id', asyncHandler(diaryController.update));

/**
 * @route DELETE /diaries/:id
 * @desc 删除日记
 * @access Private
 */
router.delete('/:id', asyncHandler(diaryController.delete));

/**
 * @route POST /diaries/:id/like
 * @desc 日记点赞
 * @access Private
 */
router.post('/:id/like', asyncHandler(diaryController.like));

/**
 * @route POST /diaries/ai/assist
 * @desc AI 日记辅助
 * @access Private
 */
router.post('/ai/assist', aiLimiter, asyncHandler(diaryController.aiAssist));

module.exports = router;
