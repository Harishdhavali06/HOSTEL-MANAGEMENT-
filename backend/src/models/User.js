import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student'
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default createModelHelper(User, 'users');
export { User };
