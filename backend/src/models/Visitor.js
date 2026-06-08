import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const VisitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  relation: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  }
}, { timestamps: true });

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);

export default createModelHelper(Visitor, 'visitors');
export { Visitor };
