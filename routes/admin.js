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

// 确保审核日志文件存在
if (!fs.existsSync(auditLogsFilePath)) {
  fs.writeFileSync(auditLogsFilePath, '[]', 'utf8');
}

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

// 获取游记审核列表 (新路径)
router.get('/diaries', (req, res) => {
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
    
    console.log('管理员获取游记列表:', { status, total, pageCount: items.length });
    
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

// 审核通过 (保留原始路径)
router.put('/notes/:id/approve', (req, res) => {
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

// 审核拒绝 (保留原始路径)
router.put('/notes/:id/reject', (req, res) => {
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

// 获取审核日志
router.get('/audit-logs', (req, res) => {
  try {
    const { noteId } = req.query;
    const auditLogs = readAuditLogs();
    
    let filteredLogs = auditLogs;
    if (noteId) {
      filteredLogs = auditLogs.filter(log => log.noteId === noteId);
    }
    
    filteredLogs = filteredLogs.sort((a, b) => 
      new Date(b.createTime) - new Date(a.createTime)
    );
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: filteredLogs
    });
  } catch (error) {
    console.error('获取审核日志失败:', error);
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
router.delete('/diaries/:id', (req, res) => {
  // 标记为管理员请求
  req.isAdmin = true;
  
  // 手动设置用户信息，因为这是管理员操作
  req.user = { id: 'admin' };
  
  // 调用删除游记控制器
  const { deleteDiary } = require('../controllers/diaryController.js');
  deleteDiary(req, res);
});

export default router; 