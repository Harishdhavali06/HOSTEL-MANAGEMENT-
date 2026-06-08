import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const studentUserId = user?._id || user?.id;
        const res = await api.get(`/attendance/student/${studentUserId}`);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to retrieve attendance history logs.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAttendance();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        <span className="text-sm font-semibold animate-pulse">Loading attendance files...</span>
      </div>
    );
  }

  const {
    totalDays = 0,
    presentDays = 0,
    absentDays = 0,
    lateDays = 0,
    leaveDays = 0,
    attendancePercentage = 100,
    logs = []
  } = data || {};

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Attendance Registry
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Check your monthly attendance stats, present count, and daily check-in logs.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon={CalendarCheck}
          description={`${presentDays} days present / ${totalDays} total`}
          color="cyan"
        />
        <StatsCard
          title="Present Days"
          value={presentDays}
          icon={CheckCircle2}
          description="In class check-ins"
          color="green"
        />
        <StatsCard
          title="Absent Days"
          value={absentDays}
          icon={AlertTriangle}
          description="Unexcused leaves"
          color="red"
        />
        <StatsCard
          title="Late / Leave"
          value={lateDays + leaveDays}
          icon={Clock}
          description={`Late: ${lateDays} • Leave: ${leaveDays}`}
          color="purple"
        />
      </div>

      {/* Logs Table */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-5">
          Daily Attendance Logs
        </h3>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No attendance history has been recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Remarks / Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {logs
                  .slice()
                  .reverse()
                  .map(log => (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="py-4 px-4 font-semibold text-slate-750 dark:text-slate-250">
                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded capitalize ${
                          log.status === 'present'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                            : log.status === 'absent'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10'
                            : log.status === 'late'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-450 italic">
                        {log.remarks || '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
