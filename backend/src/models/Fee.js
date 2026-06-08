import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const FeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'bank_transfer', 'upi']
  },
  transactionId: {
    type: String
  },
  billingMonth: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Fee = mongoose.models.Fee || mongoose.model('Fee', FeeSchema);

export default createModelHelper(Fee, 'fees');
export { Fee };
