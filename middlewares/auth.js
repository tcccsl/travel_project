import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: '未授权，请先登录',
        code: 401 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ 
        message: '无效的 token，请重新登录',
        code: 401 
      });
    }
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({ 
      message: '服务器错误',
      code: 500 
    });
  }
};

export default auth; 