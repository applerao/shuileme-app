const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
    
    const admin = await Admin.findOne({ username });
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 更新最后登录时间
    admin.lastLogin = new Date();
    await admin.save();
    
    // 生成 token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 获取当前管理员信息
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.admin._id,
      username: req.admin.username,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin
    }
  });
});

// 修改密码
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '旧密码和新密码不能为空'
      });
    }
    
    const isMatch = await req.admin.comparePassword(oldPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误'
      });
    }
    
    req.admin.password = newPassword;
    await req.admin.save();
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败',
      error: error.message
    });
  }
});

module.exports = router;
