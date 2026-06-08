import bcrypt from 'bcryptjs';
import StudentHelper from '../models/Student.js';
import UserHelper, { User } from '../models/User.js';
import RoomHelper, { Room } from '../models/Room.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin only)
export const getStudents = async (req, res) => {
  try {
    let students = await StudentHelper.find();
    
    // Populate User and Room details
    students = await StudentHelper.populate(students, [
      { path: 'user', model: UserHelper },
      { path: 'room', model: RoomHelper }
    ]);

    res.json(students);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ message: 'Server error fetching students', error: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await StudentHelper.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    const populated = await StudentHelper.populate(student, [
      { path: 'user', model: UserHelper },
      { path: 'room', model: RoomHelper }
    ]);

    res.json(populated);
  } catch (error) {
    console.error('Fetch student error:', error);
    res.status(500).json({ message: 'Server error fetching student details', error: error.message });
  }
};

// @desc    Add a student (Admin)
// @route   POST /api/students
// @access  Private (Admin only)
export const addStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, phone, parentName, parentPhone, address, branch } = req.body;

    if (!name || !email || !studentId || !phone || !parentName || !parentPhone || !address || !branch) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    // Check if user already exists
    const userExists = await UserHelper.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if studentId already exists
    const studentExists = await StudentHelper.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student ID is already registered' });
    }

    // Hash default or provided password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'student123', salt);

    // Create User
    const user = await UserHelper.create({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    });

    // Create Student
    const student = await StudentHelper.create({
      user: user._id || user.id,
      studentId,
      phone,
      parentName,
      parentPhone,
      address,
      branch
    });

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        ...student,
        user
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error adding student', error: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, parentName, parentPhone, address, branch, status } = req.body;

    const student = await StudentHelper.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update User credentials (if changed)
    const userId = student.user._id || student.user;
    const user = await UserHelper.findById(userId);
    if (user) {
      const updateUserData = {};
      if (name) updateUserData.name = name;
      if (email && email !== user.email) {
        const emailExists = await UserHelper.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        updateUserData.email = email;
      }
      await UserHelper.findByIdAndUpdate(userId, updateUserData);
    }

    // Update Student attributes
    const updateStudentData = {};
    if (phone) updateStudentData.phone = phone;
    if (parentName) updateStudentData.parentName = parentName;
    if (parentPhone) updateStudentData.parentPhone = parentPhone;
    if (address) updateStudentData.address = address;
    if (branch) updateStudentData.branch = branch;
    if (status) updateStudentData.status = status;

    const updatedStudent = await StudentHelper.findByIdAndUpdate(req.params.id, updateStudentData);

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error updating student details', error: error.message });
  }
};

// @desc    Remove student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    const student = await StudentHelper.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const userId = student.user._id || student.user;

    // Deallocate room if allocated
    if (student.room) {
      const roomId = student.room._id || student.room;
      await RoomHelper.findByIdAndUpdate(roomId, {
        $pull: { occupants: userId },
        status: 'available' // Reset state
      });
    }

    // Delete Student profile and User login
    await StudentHelper.findByIdAndDelete(req.params.id);
    await UserHelper.findByIdAndDelete(userId);

    res.json({ message: 'Student and associated credentials removed successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error removing student', error: error.message });
  }
};
