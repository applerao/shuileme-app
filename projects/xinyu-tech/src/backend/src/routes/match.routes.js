/**
 * 匹配路由模块
 * @module routes/match.routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const matchController = require('../controllers/match.controller');

router.use(authMiddleware);

/**
 * @route GET /matches/recommendations
 * @desc 获取推荐列表
 * @access Private
 */
router.get('/recommendations', asyncHandler(matchController.getRecommendations));

/**
 * @route POST /matches/:user_id/like
 * @desc 喜欢
 * @access Private
 */
router.post('/:user_id/like', asyncHandler(matchController.like));

/**
 * @route POST /matches/:user_id/pass
 * @desc 跳过
 * @access Private
 */
router.post('/:user_id/pass', asyncHandler(matchController.pass));

/**
 * @route GET /matches
 * @desc 获取匹配列表
 * @access Private
 */
router.get('/', asyncHandler(matchController.getList));

module.exports = router;
