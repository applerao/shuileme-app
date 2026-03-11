/**
 * 性格测试控制器
 * @module controllers/test.controller
 */

const { pgPool } = require('../models/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * 获取测试题目
 */
const getQuestions = async (req, res) => {
  const result = await pgPool.query(
    `SELECT id, category, question_text, options, sort_order
     FROM test_questions
     WHERE is_active = true
     ORDER BY sort_order`
  );

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      version: '1.0',
      total_questions: result.rows.length,
      estimated_time: result.rows.length * 10, // 每题约 10 秒
      questions: result.rows,
    },
  });
};

/**
 * 提交测试结果
 */
const submitTest = async (req, res) => {
  const userId = req.user.id;
  const { answers, time_spent } = req.body;

  // TODO: 计算 MBTI 结果
  // 这里简化处理，实际需要根据答案计算各维度得分

  const result_type = 'INTJ'; // 示例
  const result_scores = { E: 30, I: 70, S: 40, N: 60, T: 65, F: 35, J: 75, P: 25 };

  res.status(200).json({
    code: 200,
    message: '测试完成',
    data: {
      test_id: 'test_uuid',
      result_type,
      result_name: '建筑师型人格',
      scores: result_scores,
      description: 'INTJ 型人格是独立、创新的思想者...',
    },
  });
};

/**
 * 获取测试历史
 */
const getHistory = async (req, res) => {
  const userId = req.user.id;

  const result = await pgPool.query(
    `SELECT id as test_id, result_type, completed_at
     FROM personality_tests
     WHERE user_id = $1
     ORDER BY completed_at DESC
     LIMIT 10`,
    [userId]
  );

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      total: result.rows.length,
      tests: result.rows,
    },
  });
};

/**
 * 获取测试报告
 */
const getReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pgPool.query(
    'SELECT * FROM personality_tests WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('测试记录不存在', 404, 404);
  }

  res.status(200).json({
    code: 200,
    message: 'success',
    data: result.rows[0],
  });
};

module.exports = {
  getQuestions,
  submitTest,
  getHistory,
  getReport,
};
