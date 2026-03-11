/**
 * 会员订阅控制器
 * @module controllers/subscription.controller
 */

/**
 * 获取会员套餐
 */
const getPlans = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      plans: [
        {
          plan_id: 'plan_monthly',
          name: '月度会员',
          price: 30.00,
          currency: 'CNY',
          duration_days: 30,
          features: [
            '无限次匹配',
            '查看谁喜欢了我',
            'AI 日记辅助无限次',
            '高级筛选',
          ],
          popular: false,
        },
        {
          plan_id: 'plan_yearly',
          name: '年度会员',
          price: 298.00,
          currency: 'CNY',
          duration_days: 365,
          features: [
            '无限次匹配',
            '查看谁喜欢了我',
            'AI 日记辅助无限次',
            '高级筛选',
            '专属客服',
            '生日特权',
          ],
          popular: true,
          save_percentage: 17,
        },
      ],
    },
  });
};

/**
 * 创建订阅订单
 */
const createOrder = async (req, res) => {
  const { plan_id, payment_method } = req.body;

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      order_id: 'order_uuid',
      amount: 298.00,
      currency: 'CNY',
      payment_info: {},
      expires_in: 900,
    },
  });
};

/**
 * 查询订单状态
 */
const getOrderStatus = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      order_id: req.params.id,
      status: 'paid',
      amount: 298.00,
      paid_at: new Date().toISOString(),
    },
  });
};

/**
 * 获取会员状态
 */
const getMySubscription = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      is_vip: false,
      plan: null,
      start_date: null,
      end_date: null,
      auto_renew: false,
      remaining_days: 0,
      usage: {
        ai_assist_used: 0,
        ai_assist_limit: 10,
        matches_today: 5,
        matches_limit: 10,
      },
    },
  });
};

/**
 * 取消自动续费
 */
const cancelAutoRenew = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: '已取消自动续费',
  });
};

module.exports = {
  getPlans,
  createOrder,
  getOrderStatus,
  getMySubscription,
  cancelAutoRenew,
};
