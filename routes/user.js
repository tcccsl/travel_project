import express from 'express';
import { register, login, getUserInfo, checkNickname } from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user/info', auth, getUserInfo);
router.get('/check-nickname', checkNickname);

export default router; 