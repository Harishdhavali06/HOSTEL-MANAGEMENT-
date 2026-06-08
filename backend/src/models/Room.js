import mongoose from 'mongoose';
import { createModelHelper } from './modelHelper.js';

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple', 'dormitory'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rentPerMonth: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'full', 'maintenance'],
    default: 'available'
  }
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

export default createModelHelper(Room, 'rooms');
export { Room };
