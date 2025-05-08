/*
 * @Author: bai_xiaobaila 2108331911@qq.com
 * @Date: 2025-05-04 19:46:18
 * @LastEditors: bai_xiaobaila 2108331911@qq.com
 * @LastEditTime: 2025-05-05 00:25:04
 * @FilePath: \Code\travel-diary-platform\server\routes\upload.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from '../middlewares/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// 图片上传接口
router.post('/image', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '没有上传文件',
        data: null
      });
    }
    
    // 修改：返回完整的访问URL
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    
    res.json({
      code: 200,
      msg: '上传成功',
      data: {
        url: fileUrl  // 使用完整URL
      }
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '上传失败',
      data: null
    });
  }
});

// 视频文件过滤器
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/avi'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的视频文件类型'));
  }
};

const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: videoFileFilter
});

// 视频上传接口
router.post('/video', auth, videoUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '没有上传文件',
        data: null
      });
    }
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({
      code: 200,
      msg: '上传成功',
      data: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('视频上传错误:', error);
    res.status(500).json({
      code: 500,
      msg: error.message || '上传失败',
      data: null
    });
  }
});

// 添加在路由定义后
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // 针对图片大小超限
    if (req.originalUrl.includes('/image') && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        message: '图片文件大小不能超过5MB',
        data: null
      });
    }
    // 针对视频大小超限
    if (req.originalUrl.includes('/video') && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        message: '视频文件大小不能超过50MB',
        data: null
      });
    }
  }
  res.status(500).json({
    code: 500,
    message: error.message || '文件上传失败',
    data: null
  });
});

export default router;
