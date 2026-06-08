import express from 'express';
import { registerStudent, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
