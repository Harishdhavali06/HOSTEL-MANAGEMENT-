import RoomHelper from '../models/Room.js';
import StudentHelper from '../models/Student.js';
import UserHelper from '../models/User.js';

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
export const getRooms = async (req, res) => {
  try {
    let rooms = await RoomHelper.find();
    
    // Populate occupants' user details
    rooms = await RoomHelper.populate(rooms, [
      { path: 'occupants', model: UserHelper }
    ]);

    res.json(rooms);
  } catch (error) {
    console.error('Fetch rooms error:', error);
    res.status(500).json({ message: 'Server error fetching rooms', error: error.message });
  }
};

// @desc    Add a room (Admin)
// @route   POST /api/rooms
// @access  Private (Admin only)
export const addRoom = async (req, res) => {
  try {
    const { roomNumber, type, capacity, rentPerMonth } = req.body;

    if (!roomNumber || !type || !capacity || !rentPerMonth) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if room number is unique
    const roomExists = await RoomHelper.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const newRoom = await RoomHelper.create({
      roomNumber,
      type,
      capacity,
      rentPerMonth,
      occupants: [],
      status: 'available'
    });

    res.status(201).json({ message: 'Room added successfully', room: newRoom });
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({ message: 'Server error adding room', error: error.message });
  }
};

// @desc    Allocate room to student (Admin)
// @route   POST /api/rooms/allocate
// @access  Private (Admin only)
export const allocateRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body; // studentId is Student profile ID, roomId is Room ID

    if (!studentId || !roomId) {
      return res.status(400).json({ message: 'Please select a student and a room' });
    }

    const student = await StudentHelper.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const room = await RoomHelper.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({ message: 'Room is currently under maintenance' });
    }

    // Check if room is full
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is already fully occupied' });
    }

    const userId = student.user._id || student.user;

    // Check if student is already in a room and deallocate first
    if (student.room) {
      const oldRoomId = student.room._id || student.room;
      const oldRoom = await RoomHelper.findById(oldRoomId);
      if (oldRoom) {
        await RoomHelper.findByIdAndUpdate(oldRoomId, {
          $pull: { occupants: userId },
          status: 'available' // Mark room available if slot freed up
        });
      }
    }

    // Allocate new room
    // Add student user to room occupants
    const updatedRoom = await RoomHelper.findByIdAndUpdate(roomId, {
      $push: { occupants: userId }
    });

    // Update room availability status
    const currentOccupantsCount = (updatedRoom.occupants || []).length + 1;
    if (currentOccupantsCount >= room.capacity) {
      await RoomHelper.findByIdAndUpdate(roomId, { status: 'full' });
    } else {
      await RoomHelper.findByIdAndUpdate(roomId, { status: 'available' });
    }

    // Assign room ID to student profile
    student.room = roomId;
    await StudentHelper.findByIdAndUpdate(studentId, { room: roomId });

    res.json({ message: 'Room allocated successfully', student, room: updatedRoom });
  } catch (error) {
    console.error('Room allocation error:', error);
    res.status(500).json({ message: 'Server error allocating room', error: error.message });
  }
};

// @desc    Deallocate room from student (Admin)
// @route   POST /api/rooms/deallocate
// @access  Private (Admin only)
export const deallocateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Please provide student ID' });
    }

    const student = await StudentHelper.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.room) {
      return res.status(400).json({ message: 'Student is not allocated to any room' });
    }

    const roomId = student.room._id || student.room;
    const userId = student.user._id || student.user;

    // Pull student from room occupants list
    await RoomHelper.findByIdAndUpdate(roomId, {
      $pull: { occupants: userId },
      status: 'available' // Ensure status is set to available
    });

    // Clear student's room assignment
    student.room = null;
    await StudentHelper.findByIdAndUpdate(studentId, { room: null });

    res.json({ message: 'Student deallocated from room successfully' });
  } catch (error) {
    console.error('Deallocate room error:', error);
    res.status(500).json({ message: 'Server error deallocating room', error: error.message });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
// @access  Private
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await RoomHelper.find({ status: 'available' });
    res.json(rooms);
  } catch (error) {
    console.error('Fetch available rooms error:', error);
    res.status(500).json({ message: 'Server error fetching available rooms', error: error.message });
  }
};
