/**
 * 会员订阅路由模块
 * @module routes/subscription.routes
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const subscriptionController = require('../controllers/subscription.controller');

/**
 * @route GET /subscriptions/plans
 * @desc 获取会员套餐
 * @access Public
 */
router.get('/plans', asyncHandler(subscriptionController.getPlans));

router.use(authMiddleware);

/**
 * @route POST /subscriptions/order
 * @desc 创建订阅订单
 * @access Private
 */
router.post('/order', asyncHandler(subscriptionController.createOrder));

/**
 * @route GET /subscriptions/order/:id
 * @desc 查询订单状态
 * @access Private
 */
router.get('/order/:id', asyncHandler(subscriptionController.getOrderStatus));

/**
 * @route GET /subscriptions/me
 * @desc 获取会员状态
 * @access Private
 */
router.get('/me', asyncHandler(subscriptionController.getMySubscription));

/**
 * @route DELETE /subscriptions/auto-renew
 * @desc 取消自动续费
 * @access Private
 */
router.delete('/auto-renew', asyncHandler(subscriptionController.cancelAutoRenew));

module.exports = router;
