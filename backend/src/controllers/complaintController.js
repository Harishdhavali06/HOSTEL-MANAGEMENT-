import ComplaintHelper from '../models/Complaint.js';
import UserHelper from '../models/User.js';

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin only)
export const getComplaints = async (req, res) => {
  try {
    let complaints = await ComplaintHelper.find();
    complaints = await ComplaintHelper.populate(complaints, [
      { path: 'student', model: UserHelper }
    ]);
    res.json(complaints);
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ message: 'Server error fetching complaints board', error: error.message });
  }
};

// @desc    Get complaints for a student
// @route   GET /api/complaints/student/:studentUserId
// @access  Private
export const getStudentComplaints = async (req, res) => {
  try {
    const { studentUserId } = req.params;
    let complaints = await ComplaintHelper.find({ student: studentUserId });
    complaints = await ComplaintHelper.populate(complaints, [
      { path: 'student', model: UserHelper }
    ]);
    res.json(complaints);
  } catch (error) {
    console.error('Fetch student complaints error:', error);
    res.status(500).json({ message: 'Server error retrieving your complaints', error: error.message });
  }
};

// @desc    File a new complaint (Student)
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const studentUserId = req.user._id || req.user.id;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please enter all details' });
    }

    const complaint = await ComplaintHelper.create({
      student: studentUserId,
      title,
      description,
      category,
      status: 'pending'
    });

    res.status(201).json({ message: 'Complaint registered successfully', complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error registering complaint ticket', error: error.message });
  }
};

// @desc    Update complaint status/resolve (Admin)
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Admin only)
export const resolveComplaint = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const complaint = await ComplaintHelper.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint ticket not found' });
    }

    const updateData = { status };
    if (remarks) updateData.remarks = remarks;
    if (status === 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }

    const updatedComplaint = await ComplaintHelper.findByIdAndUpdate(req.params.id, updateData);

    res.json({ message: 'Complaint ticket updated successfully', complaint: updatedComplaint });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ message: 'Server error updating ticket resolution status', error: error.message });
  }
};
