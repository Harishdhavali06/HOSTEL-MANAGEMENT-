import express from 'express';
import { getAdminAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/admin')
  .get(authorize('admin'), getAdminAnalytics);

router.route('/student/:studentUserId')
  .get(getStudentAnalytics);

export default router;
