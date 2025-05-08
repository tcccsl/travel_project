/*
 * @Author: bai_xiaobaila 2108331911@qq.com
 * @Date: 2025-05-04 19:46:18
 * @LastEditors: bai_xiaobaila 2108331911@qq.com
 * @LastEditTime: 2025-05-05 00:26:35
 * @FilePath: \Code\travel-diary-platform\server\routes\diary.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import express from 'express';
import { 
  getDiaries, 
  getDiaryById, 
  getMyDiaries, 
  createDiary, 
  updateDiary, 
  deleteDiary 
} from '../controllers/diaryController.js';
import auth from '../middlewares/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const diariesFilePath = path.join(__dirname, '../data/diaries.json');
const auditLogsFilePath = path.join(__dirname, '../data/auditLogs.json');

/**
 * @swagger
 * /api/diary:
 *   get:
 *     summary: 获取游记列表
 *     description: 获取所有游记的列表
 *     tags: [游记管理]
 *     responses:
 *       200:
 *         description: 成功获取游记列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       video:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       500:
 *         description: 服务器错误
 */

// 读取游记数据 - 辅助函数
const readDiaries = () => {
  try {
    const data = fs.readFileSync(diariesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取游记数据失败:', error);
    return [];
  }
};

// 写入游记数据 - 辅助函数
const writeDiaries = (diaries) => {
  try {
    fs.writeFileSync(diariesFilePath, JSON.stringify(diaries, null, 2), 'utf8');
  } catch (error) {
    console.error('写入游记数据失败:', error);
  }
};

// 读取审核日志 - 辅助函数
const readAuditLogs = () => {
  try {
    if (fs.existsSync(auditLogsFilePath)) {
      const data = fs.readFileSync(auditLogsFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('读取审核日志失败:', error);
    return [];
  }
};

// 写入审核日志 - 辅助函数
const writeAuditLogs = (logs) => {
  try {
    fs.writeFileSync(auditLogsFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('写入审核日志失败:', error);
  }
};

// 获取公开游记列表（首页）
router.get('/diaries', getDiaries);

// 获取我的游记列表（需要登录）
router.get('/diaries/mine', auth, getMyDiaries);

// 获取游记详情
router.get('/diaries/:id', getDiaryById);

// 新建游记（需要登录）
router.post('/diaries', auth, createDiary);

// 修改游记（需要登录）
router.put('/diaries/:id', auth, updateDiary);

// 删除游记（需要登录）
router.delete('/diaries/:id', auth, deleteDiary);

// 兼容旧路径(DELETE /diary/:id/delete)
router.delete('/diary/:id/delete', auth, (req, res) => {
  console.log('使用/diary/:id/delete接口删除游记:', req.params.id);
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log("删除游记 - 用户ID:", userId, "游记ID:", id);
    
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);

    if (diaryIndex === -1) {
      console.log("游记不存在:", id);
      return res.status(404).json({ 
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }

    // 检查是否为用户自己的游记
    if (String(diaries[diaryIndex].userId) !== String(userId)) {
      console.log("权限不足 - 游记的用户ID:", diaries[diaryIndex].userId);
      return res.status(403).json({ 
        code: 403,
        msg: '无权删除此游记',
        data: null 
      });
    }

    console.log("删除游记成功:", id);
    diaries.splice(diaryIndex, 1);
    writeDiaries(diaries);

    res.json({ 
      code: 200, 
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    console.error("删除游记错误:", error);
    res.status(500).json({ 
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

// 更新游记状态（供前端调用）
router.put('/diary/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;
    
    console.log('更新游记状态:', { id, status, rejectReason });
    
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

// 兼容路径 - 游记删除接口(/diaries/:id/delete)
router.delete('/diaries/:id/delete', auth, (req, res) => {
  console.log('使用/diaries/:id/delete接口删除游记:', req.params.id);
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log("删除游记 - 用户ID:", userId, "游记ID:", id);
    
    const diaries = readDiaries();
    const diaryIndex = diaries.findIndex(d => d.id === id);

    if (diaryIndex === -1) {
      console.log("游记不存在:", id);
      return res.status(404).json({ 
        code: 404,
        msg: '游记不存在',
        data: null
      });
    }

    // 检查是否为用户自己的游记
    if (String(diaries[diaryIndex].userId) !== String(userId)) {
      console.log("权限不足 - 游记的用户ID:", diaries[diaryIndex].userId);
      return res.status(403).json({ 
        code: 403,
        msg: '无权删除此游记',
        data: null 
      });
    }

    console.log("删除游记成功:", id);
    diaries.splice(diaryIndex, 1);
    writeDiaries(diaries);

    res.json({ 
      code: 200, 
      msg: '删除成功',
      data: null
    });
  } catch (error) {
    console.error("删除游记错误:", error);
    res.status(500).json({ 
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

export default router;