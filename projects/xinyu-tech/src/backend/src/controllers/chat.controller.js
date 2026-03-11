/**
 * 聊天控制器
 * @module controllers/chat.controller
 */

/**
 * 获取会话列表
 */
const getConversations = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      conversations: [],
    },
  });
};

/**
 * 获取消息列表
 */
const getMessages = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      messages: [],
      has_more: false,
      next_cursor: null,
    },
  });
};

/**
 * 发送消息
 */
const sendMessage = async (req, res) => {
  const { content, type } = req.body;

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      id: 'msg_id',
      content,
      type: type || 'text',
      status: 'sent',
      created_at: new Date().toISOString(),
    },
  });
};

/**
 * 消息已读
 */
const markAsRead = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
  });
};

/**
 * 获取聊天建议
 */
const getAiSuggestions = async (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      suggestions: [],
      emotion_detected: 'neutral',
      recommended_tone: '友好',
    },
  });
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getAiSuggestions,
};
