/*
 * @Author: bai_xiaobaila 2108331911@qq.com
 * @Date: 2025-05-04 19:46:18
 * @LastEditors: bai_xiaobaila 2108331911@qq.com
 * @LastEditTime: 2025-05-04 23:36:22
 * @FilePath: \Code\travel-diary-platform\server\app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import diaryRoutes from './routes/diary.js';
import uploadRoutes from './routes/upload.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173','http://192.168.5.43:5173'], // Vite 默认端口
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// 添加路由日志中间件
app.use((req, res, next) => {
  console.log('收到请求:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  next();
});

app.use('/auth', userRoutes);

// 添加游记路由
app.use('/api', diaryRoutes);

// 添加静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 添加上传路由
app.use('/api/upload', uploadRoutes);

// 在 app.use 之前添加
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use((req, res, next) => {
  res.status(404).json({ message: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
