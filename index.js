import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 设置全局变量供其他模块使用
global.SERVER_URL = process.env.SERVER_URL || 'http://121.40.88.145:3000';
console.log(`服务器URL设置为: ${global.SERVER_URL}`);

// 路由
app.use('/api/admin', adminRoutes);

// 数据库连接
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/travel-log';
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`对外访问地址: ${global.SERVER_URL}`);
}); 