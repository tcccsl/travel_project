import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { login } from '../controllers/adminController.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const diariesFilePath = path.join(__dirname, '../data/diaries.json');
const auditLogsFilePath = path.join(__dirname, '../data/auditLogs.json');
const usersFilePath = path.join(__dirname, '../models/users.json');

// 确保审核日志文件存在
if (!fs.existsSync(auditLogsFilePath)) {
  fs.writeFileSync(auditLogsFilePath, '[]', 'utf8');
}

// 读取用户数据
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// 读取游记数据
const readDiaries = () => {
  try {
    const data = fs.readFileSync(diariesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取游记数据失败:', error);
    return [];
  }
};

// 写入游记数据
const writeDiaries = (diaries) => {
  try {
    fs.writeFileSync(diariesFilePath, JSON.stringify(diaries, null, 2), 'utf8');
  } catch (error) {
    console.error('写入游记数据失败:', error);
  }
};

// 读取审核日志
const readAuditLogs = () => {
  try {
    const data = fs.readFileSync(auditLogsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取审核日志失败:', error);
    return [];
  }
};

// 写入审核日志
const writeAuditLogs = (logs) => {
  try {
    fs.writeFileSync(auditLogsFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('写入审核日志失败:', error);
  }
};

// 管理员登录路由
router.post('/login', login);

// 获取游记审核列表
router.get('/diaries', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const diaries = readDiaries();
    const users = readUsers();
    
    // 创建用户ID到昵称的映射
    const userNicknames = {};
    users.forEach(user => {
      userNicknames[user.id] = user.nickname;
    });
    
    let filteredDiaries = diaries;
    if (status) {
      filteredDiaries = diaries.filter(diary => diary.status === status);
    }
    
    filteredDiaries = filteredDiaries.sort((a, b) => 
      new Date(b.createTime) - new Date(a.createTime)
    );
    
    const total = filteredDiaries.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = parseInt(page) * parseInt(limit);
    const items = filteredDiaries.slice(startIndex, endIndex);
    
    console.log('管理员获取游记列表:', { status, total, pageCount: items.length });
    
    res.json({
      code: 200,
      msg: "获取成功",
      data: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        list: items.map(diary => ({
          id: diary.id,
          title: diary.title,
          content: diary.content,
          location: diary.location || "",
          authorId: diary.userId,
          authorNickname: userNicknames[diary.userId] || "用户",
          createTime: diary.createTime,
          updateTime: diary.updateTime,
          status: diary.status,
          images: diary.images || [],
          videos: diary.videos || [],
          rejectReason: diary.rejectReason || ""
        }))
      }
    });
  } catch (error) {
    console.error('获取游记列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 获取游记审核列表 (保留原始路径以保持兼容性)
router.get('/notes', (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const diaries = readDiaries();
    
    let filteredDiaries = diaries;
    if (status) {
      filteredDiaries = diaries.filter(diary => diary.status === status);
    }
    
    filteredDiaries = filteredDiaries.sort((a, b) => 
      new Date(b.createTime) - new Date(a.createTime)
    );
    
    const total = filteredDiaries.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = parseInt(page) * parseInt(limit);
    const items = filteredDiaries.slice(startIndex, endIndex);
    
    res.json({
      code: 200,
      msg: "获取成功",
      data: {
        total,
        items
      }
    });
  } catch (error) {
    console.error('获取游记列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 审核通过 (添加新路径)
router.put('/diaries/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);
    
    if (diaryIndex === -1) {
      return res.status(404).json({
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }
    
    diaries[diaryIndex].status = 'approved';
    diaries[diaryIndex].rejectReason = '';
    diaries[diaryIndex].updateTime = new Date().toISOString();
    
    writeDiaries(diaries);
    
    // 记录审核日志
    const auditLogs = readAuditLogs();
    auditLogs.push({
      id: Date.now().toString(),
      noteId: id,
      auditorId: req.body.auditorId || null,
      action: 'approved',
      reason: req.body.reason || '',
      createTime: new Date().toISOString()
    });
    
    writeAuditLogs(auditLogs);
    
    res.json({
      code: 200,
      msg: '审核通过成功',
      data: diaries[diaryIndex]
    });
  } catch (error) {
    console.error('审核通过失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 审核拒绝 (添加新路径)
router.put('/diaries/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        code: 400,
        msg: '拒绝理由不能为空',
        data: null
      });
    }
    
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);
    
    if (diaryIndex === -1) {
      return res.status(404).json({
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }
    
    diaries[diaryIndex].status = 'rejected';
    diaries[diaryIndex].rejectReason = reason;
    diaries[diaryIndex].updateTime = new Date().toISOString();
    
    writeDiaries(diaries);
    
    // 记录审核日志
    const auditLogs = readAuditLogs();
    auditLogs.push({
      id: Date.now().toString(),
      noteId: id,
      auditorId: req.body.auditorId || null,
      action: 'rejected',
      reason: reason,
      createTime: new Date().toISOString()
    });
    
    writeAuditLogs(auditLogs);
    
    res.json({
      code: 200,
      msg: '审核拒绝成功',
      data: diaries[diaryIndex]
    });
  } catch (error) {
    console.error('审核拒绝失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 获取单个游记详情
router.get('/diaries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const diaries = readDiaries();
    const diary = diaries.find(d => d.id === id);
    
    if (!diary) {
      return res.status(404).json({
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: diary
    });
  } catch (error) {
    console.error('获取游记详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 添加管理员删除游记的路由
router.delete('/diary/:id/delete', (req, res) => {
  try {
    const { id } = req.params;
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);
    
    if (diaryIndex === -1) {
      return res.status(404).json({
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }
    
    // 执行删除操作
    diaries.splice(diaryIndex, 1);
    writeDiaries(diaries);
    
    // 记录审核日志
    const auditLogs = readAuditLogs();
    auditLogs.push({
      id: Date.now().toString(),
      noteId: id,
      auditorId: 'admin',
      action: 'deleted',
      reason: '管理员删除',
      createTime: new Date().toISOString()
    });
    
    writeAuditLogs(auditLogs);
    
    res.json({
      code: 200,
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除游记失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 更新游记状态
router.put('/diary/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;
    
    console.log('管理员更新游记状态:', { id, status, rejectReason });
    
    // 验证必填字段
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        code: 400,
        msg: '状态无效，必须为 approved, rejected 或 pending',
        data: null
      });
    }
    
    // 如果是拒绝状态，必须提供拒绝原因
    if (status === 'rejected' && !rejectReason) {
      return res.status(400).json({
        code: 400,
        msg: '拒绝时必须提供拒绝原因',
        data: null
      });
    }
    
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);
    
    if (diaryIndex === -1) {
      return res.status(404).json({
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }
    
    // 更新状态和拒绝原因
    diaries[diaryIndex].status = status;
    diaries[diaryIndex].rejectReason = status === 'rejected' ? rejectReason : '';
    diaries[diaryIndex].updateTime = new Date().toISOString();
    
    writeDiaries(diaries);
    
    // 记录审核日志
    const auditLogs = readAuditLogs();
    auditLogs.push({
      id: Date.now().toString(),
      noteId: id,
      auditorId: req.body.auditorId || 'admin',
      action: status,
      reason: rejectReason || '',
      createTime: new Date().toISOString()
    });
    
    writeAuditLogs(auditLogs);
    
    res.json({
      code: 200,
      msg: '状态更新成功',
      data: {
        id: diaries[diaryIndex].id,
        status: diaries[diaryIndex].status
      }
    });
  } catch (error) {
    console.error('更新游记状态失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 兼容路径 - 管理员删除游记
router.delete('/diaries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);
    
    if (diaryIndex === -1) {
      return res.status(404).json({
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }
    
    // 执行删除操作
    diaries.splice(diaryIndex, 1);
    writeDiaries(diaries);
    
    // 记录审核日志
    const auditLogs = readAuditLogs();
    auditLogs.push({
      id: Date.now().toString(),
      noteId: id,
      auditorId: 'admin',
      action: 'deleted',
      reason: '管理员删除',
      createTime: new Date().toISOString()
    });
    
    writeAuditLogs(auditLogs);
    
    res.json({
      code: 200,
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除游记失败:', error);
    res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

export default router;