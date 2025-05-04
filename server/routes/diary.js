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

const router = express.Router();

// 获取公开游记列表（首页）
router.get('/diaries', getDiaries);

// 获取游记详情
router.get('/diary/:id', getDiaryById);

// 获取我的游记列表（需要登录）
router.get('/diaries/mine', auth, getMyDiaries);

// 新建游记（需要登录）
router.post('/diary', auth, createDiary);

// 修改游记（需要登录）
router.put('/diary/:id', auth, updateDiary);

// 删除游记（需要登录）
router.delete('/diary/:id', auth, deleteDiary);

export default router;