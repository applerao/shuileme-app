/**
 * 日记控制器
 * @module controllers/diary.controller
 */

const { AppError } = require('../middleware/errorHandler');

/**
 * 获取日记列表
 */
const getList = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      total: 0,
      page: 1,
      limit: 20,
      diaries: [],
    },
  });
};

/**
 * 创建日记
 */
const create = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: '日记发布成功',
    data: {
      id: 'diary_id',
      title: req.body.title,
      created_at: new Date().toISOString(),
    },
  });
};

/**
 * 获取日记详情
 */
const getById = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {},
  });
};

/**
 * 更新日记
 */
const update = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: '更新成功',
    data: {},
  });
};

/**
 * 删除日记
 */
const delete = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: '删除成功',
  });
};

/**
 * 日记点赞
 */
const like = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      liked: true,
      like_count: 1,
    },
  });
};

/**
 * AI 日记辅助
 */
const aiAssist = async (req, res) => {
  const { content, type } = req.body;

  // TODO: 调用通义千问 API

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      type,
      original: content,
      result: 'AI 处理结果',
    },
  });
};

module.exports = {
  getList,
  create,
  getById,
  update,
  delete,
  like,
  aiAssist,
};
