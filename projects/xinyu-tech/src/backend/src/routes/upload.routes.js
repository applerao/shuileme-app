/**
 * 文件上传路由模块
 * @module routes/upload.routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { asyncHandler, uploadLimiter } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth.middleware');
const uploadController = require('../controllers/upload.controller');

// 配置 multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.use(authMiddleware);

/**
 * @route POST /upload
 * @desc 上传文件
 * @access Private
 */
router.post(
  '/',
  uploadLimiter,
  upload.single('file'),
  asyncHandler(uploadController.uploadFile)
);

module.exports = router;
