import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'leave'],
    default: 'present'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String
  }
}, { timestamps: true });

// Composite index to prevent marking duplicate attendance for the same student on the same day
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

export default createModelHelper(Attendance, 'attendances');
export { Attendance };
