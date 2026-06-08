import express from 'express';
import { getVisitors, getStudentVisitors, createVisitorLog, checkOutVisitor, updateVisitorStatus } from '../controllers/visitorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getVisitors)
  .post(createVisitorLog);

router.route('/student/:studentUserId')
  .get(getStudentVisitors);

router.route('/:id/checkout')
  .put(checkOutVisitor);

router.route('/:id/status')
  .put(authorize('admin'), updateVisitorStatus);

export default router;
