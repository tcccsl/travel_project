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

const router = express.Router();

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
  console.log('使用兼容删除路由:', req.params.id);
  // 确保参数正确传递
  const originalParams = req.params;
  req.params = { id: originalParams.id };
  deleteDiary(req, res);
});

export default router;