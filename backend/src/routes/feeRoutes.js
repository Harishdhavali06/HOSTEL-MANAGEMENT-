import express from 'express';
import { getFees, getStudentFees, createFeeBilling, payFee, getFeeStats } from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getFees);

router.route('/summary')
  .get(authorize('admin'), getFeeStats);

router.route('/student/:studentUserId')
  .get(getStudentFees);

router.route('/invoice')
  .post(authorize('admin'), createFeeBilling);

router.route('/:id/pay')
  .put(payFee);

export default router;
