/**
 * 文件上传控制器
 * @module controllers/upload.controller
 */

const { v4: uuidv4 } = require('uuid');

/**
 * 上传文件
 */
const uploadFile = async (req, res) => {
  if (!req.file) {
    throw new Error('未选择文件');
  }

  const { type = 'default' } = req.body;
  const file = req.file;

  // 生成唯一文件名
  const fileExt = file.originalname.split('.').pop();
  const filename = `${uuidv4()}.${fileExt}`;
  
  // TODO: 上传到阿里云 OSS
  // 这里返回本地 URL 示例
  const fileUrl = `https://oss.xinyu.app/uploads/${filename}`;
  const thumbnailUrl = `https://oss.xinyu.app/uploads/thumbs/${filename}`;

  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      url: fileUrl,
      thumbnail: type === 'image' ? thumbnailUrl : null,
      size: file.size,
      mimetype: file.mimetype,
    },
  });
};

module.exports = {
  uploadFile,
};
