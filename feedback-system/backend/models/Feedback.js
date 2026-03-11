const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // 反馈类型
  type: {
    type: String,
    enum: ['bug', 'suggestion', 'other'],
    required: true,
    trim: true
  },
  
  // 反馈内容
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // 截图 URL 数组
  screenshots: [{
    type: String,
    trim: true
  }],
  
  // 联系方式（可选）
  contact: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // 反馈状态
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'rejected'],
    default: 'pending'
  },
  
  // 处理备注
  adminNote: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // 处理管理员
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // 用户信息（从客户端传来）
  userInfo: {
    deviceId: String,
    appVersion: String,
    os: String,
    osVersion: String
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引优化
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
