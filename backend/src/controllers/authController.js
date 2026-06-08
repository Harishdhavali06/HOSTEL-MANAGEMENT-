import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserHelper from '../models/User.js';
import StudentHelper from '../models/Student.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforhostelmanagement123!', {
    expiresIn: '30d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, phone, parentName, parentPhone, address, branch } = req.body;

    if (!name || !email || !password || !studentId || !phone || !parentName || !parentPhone || !address || !branch) {
      return res.status(400).json({ message: 'Please enter all fields' });
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await UserHelper.create({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    });

    // Create Student profile
    const student = await StudentHelper.create({
      user: user._id || user.id,
      studentId,
      phone,
      parentName,
      parentPhone,
      address,
      branch
    });

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentDetails: student,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user (Student / Admin)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await UserHelper.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id || user.id);
    
    let studentDetails = null;
    if (user.role === 'student') {
      studentDetails = await StudentHelper.findOne({ user: user._id || user.id });
    }

    res.json({
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentDetails,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let studentDetails = null;

    if (user.role === 'student') {
      studentDetails = await StudentHelper.findOne({ user: user._id || user.id });
    }

    res.json({
      ...user,
      studentDetails
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile details', error: error.message });
  }
};
