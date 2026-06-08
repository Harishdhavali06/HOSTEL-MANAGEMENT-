import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Phone, MapPin, GraduationCap, Calendar, Home, ShieldAlert } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const studentUserId = user?._id || user?.id;
        const data = await api.get(`/auth/me`);
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
        <span className="text-sm font-semibold animate-pulse">Loading personal profile file...</span>
      </div>
    );
  }

  const studentDetails = profile?.studentDetails || {};

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Manage your personal data, emergency phone logs, and current admission details.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Profile Card details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar Banner */}
        <div className="glass-card p-6 rounded-2xl border shadow-lg flex flex-col items-center justify-center text-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-4xl shadow-lg shadow-cyan-500/15">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-5">
            {profile?.name}
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-medium mt-1">
            {profile?.email}
          </p>
          <div className="mt-4 px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 text-[10px] font-bold uppercase tracking-wider">
            {studentDetails.status || 'active'} Member
          </div>
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-5 grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 block uppercase mb-1">Branch</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{studentDetails.branch || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-855">
              <span className="text-[10px] text-slate-400 block uppercase mb-1">Room</span>
              <span className="text-cyan-500 font-bold">
                {studentDetails.room ? 'Assigned' : 'Not Allocated'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Forms detail fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Contact details */}
          <div className="glass-card p-6 rounded-2xl border shadow-lg space-y-4">
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-2">
              <User size={15} className="text-cyan-500" />
              <span>Personal Profile Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Student Roll ID</span>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 font-semibold text-slate-750 dark:text-slate-300">
                  <GraduationCap size={15} className="text-slate-400" />
                  <span>{studentDetails.studentId || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Contact Phone</span>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 font-semibold text-slate-750 dark:text-slate-300">
                  <Phone size={15} className="text-slate-400" />
                  <span>{studentDetails.phone || '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold mb-1">Residential Address</span>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 font-semibold text-slate-750 dark:text-slate-300">
                <MapPin size={15} className="text-slate-400" />
                <span>{studentDetails.address || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section: Guardian details */}
          <div className="glass-card p-6 rounded-2xl border shadow-lg space-y-4">
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-2">
              <ShieldAlert size={15} className="text-indigo-500" />
              <span>Parent / Emergency Contacts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Guardian Name</span>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 font-semibold text-slate-750 dark:text-slate-300">
                  <User size={15} className="text-slate-400" />
                  <span>{studentDetails.parentName || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Emergency Phone</span>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 font-semibold text-slate-750 dark:text-slate-300">
                  <Phone size={15} className="text-slate-400" />
                  <span>{studentDetails.parentPhone || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
