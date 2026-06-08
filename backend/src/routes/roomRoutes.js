import express from 'express';
import { getRooms, addRoom, allocateRoom, deallocateRoom, getAvailableRooms } from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRooms)
  .post(authorize('admin'), addRoom);

router.route('/available')
  .get(getAvailableRooms);

router.route('/allocate')
  .post(authorize('admin'), allocateRoom);

router.route('/deallocate')
  .post(authorize('admin'), deallocateRoom);

export default router;
