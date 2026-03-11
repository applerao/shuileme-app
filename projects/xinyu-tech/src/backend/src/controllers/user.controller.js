/**
 * 用户控制器
 * @module controllers/user.controller
 */

const { pgPool, getRedisClient } = require('../models/db');
const bcrypt = require('bcrypt');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * 获取当前用户信息
 */
const getMe = async (req, res) => {
  const userId = req.user.id;

  // 尝试从缓存获取
  const redis = getRedisClient();
  const cached = await redis.get(`cache:user:${userId}`);
  if (cached) {
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: JSON.parse(cached),
    });
  }

  // 从数据库查询
  const result = await pgPool.query(
    `SELECT id, username, email, phone, avatar_url, gender, birthday, 
            location, bio, personality_type, personality_scores, status,
            created_at
     FROM users 
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('用户不存在', 404, 404);
  }

  const user = result.rows[0];

  // 脱敏手机号
  if (user.phone) {
    user.phone = user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  // 缓存用户信息
  await redis.setex(`cache:user:${userId}`, 1800, JSON.stringify(user));

  res.status(200).json({
    code: 200,
    message: 'success',
    data: user,
  });
};

/**
 * 更新用户信息
 */
const updateMe = async (req, res) => {
  const userId = req.user.id;
  const { avatar_url, gender, birthday, location, bio } = req.body;

  const result = await pgPool.query(
    `UPDATE users 
     SET avatar_url = COALESCE($1, avatar_url),
         gender = COALESCE($2, gender),
         birthday = COALESCE($3, birthday),
         location = COALESCE($4, location),
         bio = COALESCE($5, bio),
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, username, avatar_url, updated_at`,
    [avatar_url, gender, birthday, location, bio, userId]
  );

  // 清除缓存
  await getRedisClient().del(`cache:user:${userId}`);

  res.status(200).json({
    code: 200,
    message: '更新成功',
    data: result.rows[0],
  });
};

/**
 * 修改密码
 */
const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  // 获取当前密码
  const result = await pgPool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('用户不存在', 404, 404);
  }

  // 验证旧密码
  const isMatch = await bcrypt.compare(old_password, result.rows[0].password_hash);
  if (!isMatch) {
    throw new AppError('原密码错误', 40006, 400);
  }

  // 加密新密码
  const saltRounds = 10;
  const new_password_hash = await bcrypt.hash(new_password, saltRounds);

  // 更新密码
  await pgPool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [new_password_hash, userId]
  );

  logger.info(`用户密码已更新：${userId}`);

  res.status(200).json({
    code: 200,
    message: '密码修改成功',
  });
};

/**
 * 获取用户公开信息
 */
const getUserById = async (req, res) => {
  const { id } = req.params;

  const result = await pgPool.query(
    `SELECT id, username, avatar_url, gender, location, bio, 
            personality_type, created_at
     FROM users 
     WHERE id = $1 AND status = 1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('用户不存在', 404, 404);
  }

  res.status(200).json({
    code: 200,
    message: 'success',
    data: result.rows[0],
  });
};

module.exports = {
  getMe,
  updateMe,
  updatePassword,
  getUserById,
};
