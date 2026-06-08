import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'fee', 'complaint', 'visitor'],
    default: 'announcement'
  },
  target: {
    type: String,
    enum: ['all', 'student', 'admin'],
    default: 'all'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default createModelHelper(Notification, 'notifications');
export { Notification };
