import express from 'express';
import TravelNote from '../models/TravelNote.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { login } from '../controllers/adminController.js';

const router = express.Router();

// 管理员登录路由
router.post('/login', login);

// 获取游记审核列表
router.get('/notes', async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;
  const total = await TravelNote.countDocuments(query);
  const items = await TravelNote.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('userId', 'nickname');
  res.json({ total, items });
});

// 审核通过
router.put('/notes/:id/approve', async (req, res) => {
  const note = await TravelNote.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', rejectReason: '' },
    { new: true }
  );
  await AuditLog.create({
    noteId: note._id,
    auditorId: req.body.auditorId || null, // 实际项目应从登录态获取
    action: 'approved',
    reason: req.body.reason || '',
    createdAt: new Date()
  });
  res.json({ success: true, note });
});

// 审核拒绝
router.put('/notes/:id/reject', async (req, res) => {
  const note = await TravelNote.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectReason: req.body.reason },
    { new: true }
  );
  await AuditLog.create({
    noteId: note._id,
    auditorId: req.body.auditorId || null, // 实际项目应从登录态获取
    action: 'rejected',
    reason: req.body.reason,
    createdAt: new Date()
  });
  res.json({ success: true, note });
});

// 获取审核日志
router.get('/audit-logs', async (req, res) => {
  const { noteId } = req.query;
  const logs = await AuditLog.find(noteId ? { noteId } : {})
    .populate('auditorId', 'username')
    .sort({ createdAt: -1 });
  res.json({ logs });
});

export default router; 