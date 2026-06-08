import express from 'express';
import { getComplaints, getStudentComplaints, createComplaint, resolveComplaint } from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getComplaints)
  .post(createComplaint);

router.route('/student/:studentUserId')
  .get(getStudentComplaints);

router.route('/:id/resolve')
  .put(authorize('admin'), resolveComplaint);

export default router;
