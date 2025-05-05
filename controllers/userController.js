import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, '../models/users.json');

// 确保 users.json 文件存在
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, '[]');
}

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const generateToken = (userId, username) => {
  return jwt.sign(
    { id: userId, username },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const { username, password, nickname, avatar } = req.body;

    // 验证必填字段
    if (!username || !password || !nickname) {
      return res.status(400).json({
        message: '用户名、密码和昵称为必填项'
      });
    }

    const users = readUsers();

    // 检查用户名是否已存在
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 生成用户ID
    const userId = Date.now().toString();
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = {
      id: userId,
      username,
      password: hashedPassword,
      nickname,
      avatar: avatar || null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    // 生成 token
    const token = generateToken(userId, username);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        nickname,
        avatar: newUser.avatar
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码为必填项' });
    }

    const users = readUsers();
    const user = users.find(user => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = generateToken(user.id, username);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

export const getUserInfo = (req, res) => {
  try {
    const { id } = req.user;
    const users = readUsers();
    const user = users.find(user => user.id === id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}; 