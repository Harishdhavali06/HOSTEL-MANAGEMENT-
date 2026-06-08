import StudentHelper from '../models/Student.js';
import RoomHelper from '../models/Room.js';
import FeeHelper from '../models/Fee.js';
import ComplaintHelper from '../models/Complaint.js';
import VisitorHelper from '../models/Visitor.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    const students = await StudentHelper.find();
    const rooms = await RoomHelper.find();
    const fees = await FeeHelper.find();
    const complaints = await ComplaintHelper.find();
    const visitors = await VisitorHelper.find();

    // Student counts
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;

    // Room metrics
    const totalRooms = rooms.length;
    let occupiedSlots = 0;
    let totalCapacity = 0;
    let occupiedRoomsCount = 0;

    rooms.forEach(r => {
      totalCapacity += r.capacity;
      occupiedSlots += (r.occupants || []).length;
      if (r.occupants && r.occupants.length > 0) {
        occupiedRoomsCount++;
      }
    });

    const availableRoomsCount = rooms.filter(r => r.status === 'available').length;

    // Fee metrics
    let totalRevenue = 0;
    let pendingRevenue = 0;
    fees.forEach(f => {
      if (f.status === 'paid') {
        totalRevenue += f.amount;
      } else {
        pendingRevenue += f.amount;
      }
    });

    // Complaint metrics
    const totalComplaintsCount = complaints.length;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;
    const resolvedComplaintsCount = complaints.filter(c => c.status === 'resolved').length;

    // Monthly revenue breakdown (last 6 months)
    const monthlyRevenue = {};
    fees.forEach(f => {
      if (f.status === 'paid') {
        monthlyRevenue[f.billingMonth] = (monthlyRevenue[f.billingMonth] || 0) + f.amount;
      }
    });

    const monthlyRevenueData = Object.keys(monthlyRevenue).map(month => ({
      month,
      revenue: monthlyRevenue[month]
    }));

    // Room Type occupancy statistics
    const roomTypeStats = {
      single: { total: 0, occupied: 0 },
      double: { total: 0, occupied: 0 },
      triple: { total: 0, occupied: 0 },
      dormitory: { total: 0, occupied: 0 }
    };

    rooms.forEach(r => {
      if (roomTypeStats[r.type]) {
        roomTypeStats[r.type].total += r.capacity;
        roomTypeStats[r.type].occupied += (r.occupants || []).length;
      }
    });

    const roomTypeData = Object.keys(roomTypeStats).map(type => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      capacity: roomTypeStats[type].total,
      occupied: roomTypeStats[type].occupied
    }));

    // Recent events list
    const recentActivities = [];

    // Add recent visitor checkins
    visitors.slice(-5).forEach(v => {
      recentActivities.push({
        type: 'visitor',
        message: `Visitor "${v.name}" (${v.relation}) checked in`,
        time: v.checkIn || v.createdAt
      });
    });

    // Add recent complaints
    complaints.slice(-5).forEach(c => {
      recentActivities.push({
        type: 'complaint',
        message: `New complaint filed: "${c.title}" [${c.category}]`,
        time: c.createdAt
      });
    });

    // Sort by timestamp desc
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      summary: {
        totalStudents,
        activeStudents,
        totalRooms,
        occupiedRooms: occupiedRoomsCount,
        availableRooms: availableRoomsCount,
        totalCapacity,
        occupiedSlots,
        totalRevenue,
        pendingRevenue,
        totalComplaints: totalComplaintsCount,
        pendingComplaints: pendingComplaintsCount,
        resolvedComplaints: resolvedComplaintsCount,
        totalVisitors: visitors.length
      },
      charts: {
        monthlyRevenue: monthlyRevenueData,
        roomTypeOccupancy: roomTypeData
      },
      recentActivities: recentActivities.slice(0, 8)
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ message: 'Server error generating dashboard analytics', error: error.message });
  }
};

// @desc    Get Student Dashboard Summary
// @route   GET /api/analytics/student/:studentUserId
// @access  Private
export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentUserId } = req.params;
    
    const student = await StudentHelper.findOne({ user: studentUserId });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const fees = await FeeHelper.find({ student: studentUserId });
    const complaints = await ComplaintHelper.find({ student: studentUserId });
    const visitors = await VisitorHelper.find({ student: studentUserId });

    const totalFeesCount = fees.length;
    const pendingFeesCount = fees.filter(f => f.status === 'pending' || f.status === 'overdue').length;
    const totalComplaintsCount = complaints.length;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;

    res.json({
      roomNumber: student.room ? (typeof student.room === 'object' ? student.room.roomNumber : 'Assigned') : 'Not Allocated',
      status: student.status,
      fees: {
        total: totalFeesCount,
        pending: pendingFeesCount,
        history: fees.slice(-5)
      },
      complaints: {
        total: totalComplaintsCount,
        pending: pendingComplaintsCount,
        history: complaints.slice(-5)
      },
      visitors: {
        total: visitors.length,
        history: visitors.slice(-5)
      }
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ message: 'Server error aggregating student dashboard metrics', error: error.message });
  }
};
