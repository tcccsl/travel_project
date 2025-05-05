import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 管理员登录
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查请求体
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空',
        data: null
      });
    }

    // 查找管理员
    const admin = Admin.findByUsername(username);
    
    // 验证管理员存在并密码匹配
    if (!admin || admin.password !== password) {
      return res.status(401).json({
        code: 401,
        msg: '用户名或密码错误',
        data: null
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 返回成功响应
    return res.status(200).json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    return res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}; 