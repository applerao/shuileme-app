const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Admin = require('../models/Admin');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// ==================== 用户端接口 ====================

// 提交反馈
router.post('/submit', upload.array('screenshots', 5), async (req, res) => {
  try {
    const { type, content, contact, deviceId, appVersion, os, osVersion } = req.body;
    
    // 验证必填字段
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        message: '反馈类型和内容不能为空'
      });
    }
    
    // 验证反馈类型
    if (!['bug', 'suggestion', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的反馈类型'
      });
    }
    
    // 处理截图
    const screenshots = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        screenshots.push(`/uploads/screenshots/${file.filename}`);
      });
    }
    
    // 创建反馈记录
    const feedback = new Feedback({
      type,
      content,
      screenshots,
      contact: contact || '',
      userInfo: {
        deviceId: deviceId || '',
        appVersion: appVersion || '',
        os: os || '',
        osVersion: osVersion || ''
      }
    });
    
    await feedback.save();
    
    res.status(201).json({
      success: true,
      message: '反馈提交成功',
      data: {
        feedbackId: feedback._id,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '提交反馈失败',
      error: error.message
    });
  }
});

// ==================== 管理员接口 ====================

// 获取反馈列表（支持分页和筛选）
router.get('/list', verifyToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      keyword,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    // 类型筛选
    if (type) {
      query.type = type;
    }
    
    // 状态筛选
    if (status) {
      query.status = status;
    }
    
    // 关键词搜索
    if (keyword) {
      query.$or = [
        { content: { $regex: keyword, $options: 'i' } },
        { contact: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('handledBy', 'username'),
      Feedback.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        list: feedbacks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取反馈列表失败',
      error: error.message
    });
  }
});

// 获取反馈详情
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('handledBy', 'username');
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('获取反馈详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取反馈详情失败',
      error: error.message
    });
  }
});

// 更新反馈状态
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    
    if (status && !['pending', 'processing', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    updateData.handledBy = req.admin._id;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('handledBy', 'username');
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '反馈不存在'
      });
    }
    
    res.json({
      success: true,
      message: '状态更新成功',
      data: feedback
    });
  } catch (error) {
    console.error('更新反馈状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新反馈状态失败',
      error: error.message
    });
  }
});

// 导出反馈数据（Excel）
router.get('/export', verifyToken, async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    
    // 创建 Excel 工作簿
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('反馈数据');
    
    // 设置列
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 25 },
      { header: '类型', key: 'type', width: 15 },
      { header: '内容', key: 'content', width: 50 },
      { header: '状态', key: 'status', width: 15 },
      { header: '联系方式', key: 'contact', width: 20 },
      { header: '设备信息', key: 'deviceInfo', width: 30 },
      { header: '创建时间', key: 'createdAt', width: 25 },
      { header: '处理人', key: 'handledBy', width: 15 },
      { header: '处理备注', key: 'adminNote', width: 30 }
    ];
    
    // 添加数据
    const typeMap = { bug: 'Bug', suggestion: '建议', other: '其他' };
    const statusMap = { 
      pending: '待处理', 
      processing: '处理中', 
      resolved: '已解决', 
      rejected: '已拒绝' 
    };
    
    feedbacks.forEach(fb => {
      worksheet.addRow({
        id: fb._id.toString(),
        type: typeMap[fb.type] || fb.type,
        content: fb.content,
        status: statusMap[fb.status] || fb.status,
        contact: fb.contact || '-',
        deviceInfo: fb.userInfo ? 
          `${fb.userInfo.os} ${fb.userInfo.osVersion} (v${fb.userInfo.appVersion})` : '-',
        createdAt: fb.createdAt.toLocaleString('zh-CN'),
        handledBy: fb.handledBy ? fb.handledBy.username : '-',
        adminNote: fb.adminNote || '-'
      });
    });
    
    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=反馈数据_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('导出反馈数据失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

// 获取统计数据
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [total, typeStats, statusStats] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Feedback.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    
    const typeMap = { bug: 'Bug', suggestion: '建议', other: '其他' };
    const statusMap = { 
      pending: '待处理', 
      processing: '处理中', 
      resolved: '已解决', 
      rejected: '已拒绝' 
    };
    
    res.json({
      success: true,
      data: {
        total,
        byType: typeStats.reduce((acc, item) => {
          acc[typeMap[item._id] || item._id] = item.count;
          return acc;
        }, {}),
        byStatus: statusStats.reduce((acc, item) => {
          acc[statusMap[item._id] || item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

module.exports = router;
