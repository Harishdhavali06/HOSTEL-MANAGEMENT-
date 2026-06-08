import express from 'express';
import { getStudents, getStudentById, addStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getStudents)
  .post(authorize('admin'), addStudent);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(authorize('admin'), deleteStudent);

export default router;
