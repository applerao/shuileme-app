/**
 * 匹配控制器
 * @module controllers/match.controller
 */

/**
 * 获取推荐列表
 */
const getRecommendations = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      total: 0,
      page: 1,
      recommendations: [],
    },
  });
};

/**
 * 喜欢
 */
const like = async (req, res) => {
  const { user_id } = req.params;
  const { message } = req.body;

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      match_id: 'match_uuid',
      status: 'pending',
      is_mutual: false,
    },
  });
};

/**
 * 跳过
 */
const pass = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
  });
};

/**
 * 获取匹配列表
 */
const getList = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      total: 0,
      matches: [],
    },
  });
};

module.exports = {
  getRecommendations,
  like,
  pass,
  getList,
};
