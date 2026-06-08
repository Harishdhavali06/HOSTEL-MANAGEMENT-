import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const ComplaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'food', 'cleanliness', 'internet', 'security', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

export default createModelHelper(Complaint, 'complaints');
export { Complaint };
