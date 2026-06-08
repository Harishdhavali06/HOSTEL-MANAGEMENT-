import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, Save, CheckCircle, XCircle, Clock, Plane } from 'lucide-react';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState({}); // studentUserId -> status
  const [remarks, setRemarks] = useState({}); // studentUserId -> remark string
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch student listings and current logs for date
  const fetchStudentsAndLogs = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const studs = await api.get('/students');
      setStudents(studs);

      // Fetch existing logs for selected date
      const dateLogs = await api.get(`/attendance/date/${selectedDate}`);
      
      const logsMap = {};
      const remarksMap = {};
      
      // Default all active students to present
      studs.forEach(s => {
        logsMap[s.user?._id || s.user] = 'present';
        remarksMap[s.user?._id || s.user] = '';
      });

      // Overlay existing records if found
      dateLogs.forEach(log => {
        const studentUserId = typeof log.student === 'object' ? log.student._id || log.student.id : log.student;
        logsMap[studentUserId] = log.status;
        remarksMap[studentUserId] = log.remarks || '';
      });

      setAttendanceLogs(logsMap);
      setRemarks(remarksMap);
    } catch (err) {
      setError(err.message || 'Failed to retrieve student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndLogs();
  }, [selectedDate]);

  const handleStatusChange = (studentUserId, statusVal) => {
    setAttendanceLogs(prev => ({
      ...prev,
      [studentUserId]: statusVal
    }));
  };

  const handleRemarkChange = (studentUserId, remarkVal) => {
    setRemarks(prev => ({
      ...prev,
      [studentUserId]: remarkVal
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    const attendanceList = students.map(s => {
      const studentUserId = s.user?._id || s.user;
      return {
        studentUserId,
        status: attendanceLogs[studentUserId] || 'present',
        remarks: remarks[studentUserId] || ''
      };
    });

    try {
      await api.post('/attendance', {
        date: selectedDate,
        attendanceList
      });
      setMessage('Attendance logs saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save attendance logs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Daily Attendance
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Choose a date and record present/absent logs for all students.
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm w-full sm:w-auto justify-between">
            <Calendar size={15} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none focus:ring-0 text-slate-350"
            />
          </div>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Logs'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Roster list */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Loading student rosters...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active students found in records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Room No</th>
                  <th className="py-3.5 px-4 text-center">Mark Status</th>
                  <th className="py-3.5 px-4">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {students.map(student => {
                  const studentUserId = student.user?._id || student.user;
                  const currentStatus = attendanceLogs[studentUserId] || 'present';
                  return (
                    <tr key={student._id || student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.user?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{student.studentId} • {student.branch}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-cyan-500">
                        {student.room ? `Room ${student.room.roomNumber}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center items-center space-x-2">
                          {[
                            { val: 'present', label: 'Present', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
                            { val: 'absent', label: 'Absent', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: XCircle },
                            { val: 'late', label: 'Late', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
                            { val: 'leave', label: 'Leave', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', icon: Plane }
                          ].map(item => {
                            const Icon = item.icon;
                            const isSelected = currentStatus === item.val;
                            return (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => handleStatusChange(studentUserId, item.val)}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                                  isSelected 
                                    ? item.color
                                    : 'bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900'
                                }`}
                              >
                                <Icon size={12} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional comments..."
                          value={remarks[studentUserId] || ''}
                          onChange={(e) => handleRemarkChange(studentUserId, e.target.value)}
                          className="w-full max-w-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
