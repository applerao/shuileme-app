/**
 * 聊天路由模块
 * @module routes/chat.routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

router.use(authMiddleware);

/**
 * @route GET /conversations
 * @desc 获取会话列表
 * @access Private
 */
router.get('/', asyncHandler(chatController.getConversations));

/**
 * @route GET /conversations/:id/messages
 * @desc 获取消息列表
 * @access Private
 */
router.get('/:id/messages', asyncHandler(chatController.getMessages));

/**
 * @route POST /conversations/:id/messages
 * @desc 发送消息
 * @access Private
 */
router.post('/:id/messages', asyncHandler(chatController.sendMessage));

/**
 * @route POST /conversations/:id/read
 * @desc 消息已读
 * @access Private
 */
router.post('/:id/read', asyncHandler(chatController.markAsRead));

/**
 * @route POST /chat/ai/suggestions
 * @desc 获取聊天建议
 * @access Private
 */
router.post('/ai/suggestions', asyncHandler(chatController.getAiSuggestions));

module.exports = router;
