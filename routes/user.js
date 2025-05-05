import express from 'express';
import { register, login, getUserInfo } from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user/info', auth, getUserInfo);

export default router; 