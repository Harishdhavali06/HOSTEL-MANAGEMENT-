import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import NotificationBadge from '../components/NotificationBadge';
import {
  Bed,
  CreditCard,
  AlertCircle,
  UserCheck,
  CalendarCheck,
  PlusCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentDashboardData = async () => {
    try {
      const studentUserId = user?._id || user?.id;
      
      // Fetch general student stats
      const statsData = await api.get(`/analytics/student/${studentUserId}`);
      setStats(statsData);

      // Fetch attendance summary
      const attendanceData = await api.get(`/attendance/student/${studentUserId}`);
      setAttendance(attendanceData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        <span className="text-sm font-semibold animate-pulse">Loading Student Hub...</span>
      </div>
    );
  }

  const { roomNumber = 'Not Assigned', status = 'Active', fees = {}, complaints = {}, visitors = {} } = stats || {};
  const { attendancePercentage = 100 } = attendance || {};

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Dashboard Top Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Status: <span className="text-emerald-500 dark:text-emerald-400 font-bold capitalize">{status}</span> • Allocated Room: <span className="text-cyan-500 dark:text-cyan-400 font-bold">{roomNumber}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <NotificationBadge />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Numerical Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="My Room"
          value={roomNumber}
          icon={Bed}
          description="Residency details"
          color="cyan"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon={CalendarCheck}
          description="Present days percentage"
          color="green"
        />
        <StatsCard
          title="Unpaid Invoices"
          value={fees.pending || 0}
          icon={CreditCard}
          description="Pending billings"
          color="amber"
        />
        <StatsCard
          title="Filed Tickets"
          value={complaints.total || 0}
          icon={AlertCircle}
          description={`${complaints.pending || 0} pending resolution`}
          color="red"
        />
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="glass-card p-6 rounded-2xl border mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md bg-gradient-to-r from-indigo-500/5 to-cyan-500/5">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
            <PlusCircle size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Need assistance or logging guest entry?
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instantly lodge plumbing/electrical complaints or pre-approve guest entries.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/student-complaints"
            className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md shadow-red-500/10 transition-transform active:scale-[0.98]"
          >
            File Complaint
          </Link>
          <Link
            to="/student-visitors"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/10 transition-transform active:scale-[0.98]"
          >
            Log Visitor
          </Link>
        </div>
      </div>

      {/* Lists Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices list */}
        <div className="glass-card p-6 rounded-2xl border shadow-lg">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Recent Invoices
            </h3>
            <Link to="/student-fees" className="text-xs text-indigo-500 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {fees.history?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No fee invoices found
              </div>
            ) : (
              fees.history?.map(fee => (
                <div key={fee._id || fee.id} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="text-slate-400" size={16} />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-300">
                        {fee.billingMonth} Billing
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Due: {new Date(fee.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-slate-300">
                      ${fee.amount}
                    </p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                      fee.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20'
                    }`}>
                      {fee.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Complaints list */}
        <div className="glass-card p-6 rounded-2xl border shadow-lg">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              My Complaints Tickets
            </h3>
            <Link to="/student-complaints" className="text-xs text-indigo-500 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {complaints.history?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No complaint tickets submitted
              </div>
            ) : (
              complaints.history?.map(c => (
                <div key={c._id || c.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-850 dark:text-slate-350">
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Category: <span className="capitalize">{c.category}</span>
                      </p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      c.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : c.status === 'in_progress'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  {c.remarks && (
                    <div className="mt-2.5 p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 italic">
                      Admin: {c.remarks}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
