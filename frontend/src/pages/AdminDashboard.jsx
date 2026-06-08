import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import { RevenueChart, OccupancyPieChart } from '../components/Charts';
import NotificationBadge from '../components/NotificationBadge';
import {
  Users,
  Bed,
  DollarSign,
  AlertTriangle,
  Send,
  PlusCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Announcement fields
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState('announcement');
  const [annLoading, setAnnLoading] = useState(false);
  const [annSuccess, setAnnSuccess] = useState('');

  const fetchAnalytics = async () => {
    try {
      const data = await api.get('/analytics/admin');
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve admin dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    setAnnLoading(true);
    setAnnSuccess('');
    setError('');

    try {
      await api.post('/notifications', {
        title: annTitle,
        message: annMessage,
        type: annType,
        target: 'all'
      });
      setAnnSuccess('Announcement posted successfully!');
      setAnnTitle('');
      setAnnMessage('');
      // Refresh analytics activity feed
      fetchAnalytics();
    } catch (err) {
      setError(err.message || 'Failed to publish announcement.');
    } finally {
      setAnnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        <span className="text-sm font-semibold animate-pulse">Retrieving analytics dashboards...</span>
      </div>
    );
  }

  const { summary = {}, charts = {}, recentActivities = [] } = analytics || {};

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Real-time occupancy tracking, collection reports, and notifications center.
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
          title="Total Students"
          value={summary.totalStudents || 0}
          icon={Users}
          description={`Active users: ${summary.activeStudents || 0}`}
          trend="+4%"
          color="blue"
        />
        <StatsCard
          title="Occupied Rooms"
          value={`${summary.occupiedRooms || 0}/${summary.totalRooms || 0}`}
          icon={Bed}
          description={`${summary.occupiedSlots || 0} slots occupied / ${summary.totalCapacity || 0} total`}
          trend={`${Math.round(((summary.occupiedSlots || 0) / (summary.totalCapacity || 1)) * 100)}%`}
          color="purple"
        />
        <StatsCard
          title="Total Collected"
          value={`$${summary.totalRevenue || 0}`}
          icon={DollarSign}
          description={`Outstanding: $${summary.pendingRevenue || 0}`}
          trend="+18%"
          color="green"
        />
        <StatsCard
          title="Open Complaints"
          value={summary.pendingComplaints || 0}
          icon={AlertTriangle}
          description={`Resolved tickets: ${summary.resolvedComplaints || 0}`}
          trend={`${summary.totalComplaints ? Math.round((summary.resolvedComplaints / summary.totalComplaints) * 100) : 100}% rate`}
          color="red"
        />
      </div>

      {/* Visual Analytics Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Collection Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-6">
            Revenue Collections
          </h3>
          <RevenueChart data={charts.monthlyRevenue} />
        </div>

        {/* Room Occupancy Chart */}
        <div className="glass-card p-6 rounded-2xl border shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-6">
            Room Type Allocation
          </h3>
          <OccupancyPieChart data={charts.roomTypeOccupancy} />
        </div>
      </div>

      {/* Activity Logs & Announcements Posting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities Feed */}
        <div className="glass-card p-6 rounded-2xl border shadow-lg">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-5">
            Hostel Log Activity
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent activity records registered
              </div>
            ) : (
              recentActivities.map((act, index) => (
                <div key={index} className="flex items-start space-x-3 text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className={`p-1.5 rounded-lg border text-white ${
                    act.type === 'visitor' ? 'bg-cyan-500 border-cyan-500/10' : 'bg-amber-500 border-amber-500/10'
                  }`}>
                    {act.type === 'visitor' ? <Users size={12} /> : <AlertTriangle size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {act.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(act.time).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bulletins Announcements Dispatcher */}
        <div className="glass-card p-6 rounded-2xl border shadow-lg flex flex-col">
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-5 flex items-center space-x-2">
            <PlusCircle size={16} className="text-cyan-500" />
            <span>Publish Global Announcement</span>
          </h3>

          {annSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
              {annSuccess}
            </div>
          )}

          <form onSubmit={handlePostAnnouncement} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Announcement Title"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={3}
                  placeholder="Write message instructions..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-400 font-semibold">Alert Priority:</span>
                <div className="flex space-x-3">
                  {['announcement', 'fee', 'complaint'].map(type => (
                    <label key={type} className="inline-flex items-center space-x-1.5 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="annType"
                        value={type}
                        checked={annType === type}
                        onChange={(e) => setAnnType(e.target.value)}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span className="capitalize text-slate-400">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={annLoading}
              className="w-full mt-4 py-3 rounded-xl text-xs font-semibold tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{annLoading ? 'Broadcasting...' : 'Broadcast Alert'}</span>
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
