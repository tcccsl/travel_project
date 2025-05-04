/*
 * @Author: bai_xiaobaila 2108331911@qq.com
 * @Date: 2025-05-04 19:46:18
 * @LastEditors: bai_xiaobaila 2108331911@qq.com
 * @LastEditTime: 2025-05-05 00:26:35
 * @FilePath: \Code\travel-diary-platform\server\routes\diary.js
 * @Description: 游记相关路由
 */
import express from 'express';
import { 
  getDiaries, 
  getDiaryById, 
  getMyDiaries, 
  createDiary, 
  updateDiary, 
  deleteDiary,
  updateDiaryStatus,
  deleteDiaryByAdmin,
  getAdminDiaries
} from '../controllers/diaryController.js';
import auth from '../middlewares/auth.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// 公共接口
router.get('/diaries', getDiaries);
router.get('/diary/:id', getDiaryById);

// 需要用户登录的接口
router.get('/diaries/mine', auth, getMyDiaries);
router.post('/diary', auth, createDiary);
router.put('/diary/:id', auth, updateDiary);
router.delete('/diary/:id', auth, deleteDiary);

// 管理员接口
router.get('/admin/diaries', adminAuth, getAdminDiaries);
router.put('/diary/:id/status', adminAuth, updateDiaryStatus);
router.delete('/diary/:id/delete', adminAuth, deleteDiaryByAdmin);

export default router;