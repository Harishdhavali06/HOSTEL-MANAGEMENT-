import express from 'express';
import { markAttendance, getAttendanceByDate, getStudentAttendanceSummary } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('admin'), markAttendance);

router.route('/date/:dateStr')
  .get(authorize('admin'), getAttendanceByDate);

router.route('/student/:studentUserId')
  .get(getStudentAttendanceSummary);

export default router;
