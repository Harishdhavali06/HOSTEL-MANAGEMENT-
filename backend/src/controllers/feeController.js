import FeeHelper from '../models/Fee.js';
import UserHelper from '../models/User.js';
import StudentHelper from '../models/Student.js';

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Private (Admin only)
export const getFees = async (req, res) => {
  try {
    let fees = await FeeHelper.find();
    
    // Populate student user info
    fees = await FeeHelper.populate(fees, [
      { path: 'student', model: UserHelper }
    ]);

    res.json(fees);
  } catch (error) {
    console.error('Fetch fees error:', error);
    res.status(500).json({ message: 'Server error fetching fee records', error: error.message });
  }
};

// @desc    Get student fee history
// @route   GET /api/fees/student/:studentUserId
// @access  Private
export const getStudentFees = async (req, res) => {
  try {
    const { studentUserId } = req.params;
    let fees = await FeeHelper.find({ student: studentUserId });
    
    fees = await FeeHelper.populate(fees, [
      { path: 'student', model: UserHelper }
    ]);

    res.json(fees);
  } catch (error) {
    console.error('Fetch student fees error:', error);
    res.status(500).json({ message: 'Server error fetching student fee records', error: error.message });
  }
};

// @desc    Generate monthly invoice for student
// @route   POST /api/fees/invoice
// @access  Private (Admin only)
export const createFeeBilling = async (req, res) => {
  try {
    const { studentUserId, amount, dueDate, billingMonth } = req.body;

    if (!studentUserId || !amount || !dueDate || !billingMonth) {
      return res.status(400).json({ message: 'Please enter all details' });
    }

    // Check if billing already generated for this student and month
    const invoiceExists = await FeeHelper.findOne({ student: studentUserId, billingMonth });
    if (invoiceExists) {
      return res.status(400).json({ message: `Invoice for ${billingMonth} already exists for this student` });
    }

    const fee = await FeeHelper.create({
      student: studentUserId,
      amount,
      dueDate: new Date(dueDate),
      billingMonth,
      status: 'pending'
    });

    res.status(201).json({ message: 'Invoice generated successfully', fee });
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Server error generating invoice', error: error.message });
  }
};

// @desc    Record fee payment
// @route   PUT /api/fees/:id/pay
// @access  Private
export const payFee = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Please specify payment method' });
    }

    const fee = await FeeHelper.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee invoice record not found' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ message: 'Fee invoice is already paid' });
    }

    const updatedFee = await FeeHelper.findByIdAndUpdate(req.params.id, {
      status: 'paid',
      paymentDate: new Date().toISOString(),
      paymentMethod,
      transactionId: transactionId || `TXN${Math.floor(100000 + Math.random() * 900000)}`
    });

    res.json({ message: 'Payment recorded successfully', fee: updatedFee });
  } catch (error) {
    console.error('Pay fee error:', error);
    res.status(500).json({ message: 'Server error logging payment', error: error.message });
  }
};

// @desc    Get financial summary (Admin dashboard helper)
// @route   GET /api/fees/summary
// @access  Private (Admin only)
export const getFeeStats = async (req, res) => {
  try {
    const fees = await FeeHelper.find();
    let totalRevenue = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    fees.forEach(fee => {
      if (fee.status === 'paid') {
        totalRevenue += fee.amount;
        paidCount++;
      } else {
        totalPending += fee.amount;
        pendingCount++;
      }
    });

    res.json({
      totalRevenue,
      totalPending,
      paidCount,
      pendingCount,
      totalInvoices: fees.length
    });
  } catch (error) {
    console.error('Fetch fee summary error:', error);
    res.status(500).json({ message: 'Server error fetching invoice stats', error: error.message });
  }
};
