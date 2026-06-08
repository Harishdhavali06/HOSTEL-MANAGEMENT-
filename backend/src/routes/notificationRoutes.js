import express from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(authorize('admin'), createNotification);

router.route('/:id/read')
  .put(markAsRead);

export default router;
