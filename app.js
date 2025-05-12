import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import diaryRoutes from './routes/diary.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置全局服务器URL
global.SERVER_URL = process.env.SERVER_URL || 'http://121.40.88.145:3000';
console.log(`服务器URL设置为: ${global.SERVER_URL}`);

const app = express();

// CORS 配置
const corsOptions = {
  origin: ['http://localhost:5173', 'http://192.168.5.43:5173','http://26.233.129.1118:5173', 'http://121.40.88.145:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 86400
};

// 中间件配置
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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

// 添加游记路由 - 同时支持多个前缀
app.use('/', diaryRoutes);  // 支持 http://localhost:3000/diaries
app.use('/api', diaryRoutes); // 支持 /api/diaries

// 添加静态文件服务 - 确保可以通过服务器IP访问
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 添加上传路由
app.use('/api/upload', uploadRoutes);

// 添加管理员路由
app.use('/api/admin', adminRoutes);

// 添加URL修复中间件 - 用于处理数据库中已存在的localhost URL
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    // 如果是JSON响应，尝试替换所有localhost URL
    if (typeof body === 'string' && body.startsWith('{') && body.includes('localhost:3000')) {
      body = body.replace(/http:\/\/localhost:3000/g, global.SERVER_URL);
    }
    return originalSend.call(this, body);
  };
  next();
});

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '旅行日记平台 API 文档',
      version: '1.0.0',
      description: '旅行日记平台后端 API 接口文档',
    },
    servers: [
      {
        url: global.SERVER_URL,
        description: '服务器',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // API 文件路径
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    message: '服务器错误',
    error: err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`对外访问地址: ${global.SERVER_URL}`);
});

export default app; 
