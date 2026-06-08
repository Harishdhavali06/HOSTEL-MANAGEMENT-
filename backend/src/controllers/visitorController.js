import VisitorHelper from '../models/Visitor.js';
import UserHelper from '../models/User.js';
import StudentHelper from '../models/Student.js';

// @desc    Get all visitor logs
// @route   GET /api/visitors
// @access  Private (Admin only)
export const getVisitors = async (req, res) => {
  try {
    let visitors = await VisitorHelper.find();
    visitors = await VisitorHelper.populate(visitors, [
      { path: 'student', model: UserHelper }
    ]);
    res.json(visitors);
  } catch (error) {
    console.error('Fetch visitors error:', error);
    res.status(500).json({ message: 'Server error fetching visitor logs', error: error.message });
  }
};

// @desc    Get student visitor logs
// @route   GET /api/visitors/student/:studentUserId
// @access  Private
export const getStudentVisitors = async (req, res) => {
  try {
    const { studentUserId } = req.params;
    let visitors = await VisitorHelper.find({ student: studentUserId });
    visitors = await VisitorHelper.populate(visitors, [
      { path: 'student', model: UserHelper }
    ]);
    res.json(visitors);
  } catch (error) {
    console.error('Fetch student visitors error:', error);
    res.status(500).json({ message: 'Server error fetching student visitor logs', error: error.message });
  }
};

// @desc    Add a visitor log
// @route   POST /api/visitors
// @access  Private
export const createVisitorLog = async (req, res) => {
  try {
    const { name, phone, relation, studentUserId, purpose } = req.body;

    if (!name || !phone || !relation || !studentUserId || !purpose) {
      return res.status(400).json({ message: 'Please enter all visitor details' });
    }

    const visitor = await VisitorHelper.create({
      name,
      phone,
      relation,
      student: studentUserId,
      purpose,
      checkIn: new Date().toISOString(),
      status: 'approved' // Default to approved
    });

    res.status(201).json({ message: 'Visitor entry logged successfully', visitor });
  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({ message: 'Server error creating visitor log', error: error.message });
  }
};

// @desc    Check-out visitor
// @route   PUT /api/visitors/:id/checkout
// @access  Private
export const checkOutVisitor = async (req, res) => {
  try {
    const visitor = await VisitorHelper.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor log not found' });
    }

    if (visitor.checkOut) {
      return res.status(400).json({ message: 'Visitor has already checked out' });
    }

    const updated = await VisitorHelper.findByIdAndUpdate(req.params.id, {
      checkOut: new Date().toISOString()
    });

    res.json({ message: 'Visitor check-out logged successfully', visitor: updated });
  } catch (error) {
    console.error('Checkout visitor error:', error);
    res.status(500).json({ message: 'Server error logging visitor check-out', error: error.message });
  }
};

// @desc    Update visitor approval status
// @route   PUT /api/visitors/:id/status
// @access  Private (Admin only)
export const updateVisitorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid approval status' });
    }

    const visitor = await VisitorHelper.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor log not found' });
    }

    const updated = await VisitorHelper.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Visitor status updated to ${status}`, visitor: updated });
  } catch (error) {
    console.error('Update visitor status error:', error);
    res.status(500).json({ message: 'Server error updating visitor status', error: error.message });
  }
};
