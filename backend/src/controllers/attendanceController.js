import AttendanceHelper from '../models/Attendance.js';
import UserHelper from '../models/User.js';
import StudentHelper from '../models/Student.js';

// @desc    Mark attendance for students (Admin)
// @route   POST /api/attendance
// @access  Private (Admin only)
export const markAttendance = async (req, res) => {
  try {
    const { date, attendanceList } = req.body; // date: ISO string, attendanceList: Array of { studentUserId, status, remarks }

    if (!date || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ message: 'Please provide date and attendance logs' });
    }

    const markedBy = req.user._id || req.user.id;
    const targetDate = new Date(date);
    // Standardize to start of day for comparison
    targetDate.setUTCHours(0, 0, 0, 0);

    const savedRecords = [];

    for (let record of attendanceList) {
      const { studentUserId, status, remarks } = record;

      // Check if attendance already marked for this student on this day
      // In local JSON db, we query by student and match date normalized to start of day
      const existing = await AttendanceHelper.find({ student: studentUserId });
      const sameDayRecord = existing.find(att => {
        const d = new Date(att.date);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime() === targetDate.getTime();
      });

      if (sameDayRecord) {
        // Update existing record
        const updated = await AttendanceHelper.findByIdAndUpdate(sameDayRecord._id || sameDayRecord.id, {
          status,
          remarks: remarks || '',
          markedBy
        });
        savedRecords.push(updated);
      } else {
        // Create new record
        const newRecord = await AttendanceHelper.create({
          student: studentUserId,
          date: targetDate.toISOString(),
          status,
          remarks: remarks || '',
          markedBy
        });
        savedRecords.push(newRecord);
      }
    }

    res.status(200).json({ message: 'Attendance marked successfully', recordsCount: savedRecords.length });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error saving attendance', error: error.message });
  }
};

// @desc    Get attendance status for a date
// @route   GET /api/attendance/date/:dateStr
// @access  Private (Admin only)
export const getAttendanceByDate = async (req, res) => {
  try {
    const { dateStr } = req.params; // Format: YYYY-MM-DD
    const queryDate = new Date(dateStr);
    queryDate.setUTCHours(0, 0, 0, 0);

    let logs = await AttendanceHelper.find();
    
    // Filter matching day in memory/query
    let dayLogs = logs.filter(log => {
      const d = new Date(log.date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === queryDate.getTime();
    });

    dayLogs = await AttendanceHelper.populate(dayLogs, [
      { path: 'student', model: UserHelper }
    ]);

    res.json(dayLogs);
  } catch (error) {
    console.error('Fetch attendance by date error:', error);
    res.status(500).json({ message: 'Server error retrieving attendance records', error: error.message });
  }
};

// @desc    Get student attendance summary
// @route   GET /api/attendance/student/:studentUserId
// @access  Private
export const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentUserId } = req.params;
    const logs = await AttendanceHelper.find({ student: studentUserId });

    const totalDays = logs.length;
    const presentDays = logs.filter(log => log.status === 'present').length;
    const absentDays = logs.filter(log => log.status === 'absent').length;
    const lateDays = logs.filter(log => log.status === 'late').length;
    const leaveDays = logs.filter(log => log.status === 'leave').length;

    const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays + leaveDays) / totalDays) * 100 : 100;

    res.json({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      attendancePercentage: Math.round(attendancePercentage),
      logs
    });
  } catch (error) {
    console.error('Fetch attendance summary error:', error);
    res.status(500).json({ message: 'Server error summarizing attendance analytics', error: error.message });
  }
};
