import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, UserCheck, Clock, UserX, AlertCircle } from 'lucide-react';

const StudentVisitors = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [purpose, setPurpose] = useState('');

  const fetchStudentVisitors = async () => {
    try {
      const studentUserId = user?._id || user?.id;
      const data = await api.get(`/visitors/student/${studentUserId}`);
      setVisitors(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve visitor history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentVisitors();
    }
  }, [user]);

  const handleOpenLogModal = () => {
    setName('');
    setPhone('');
    setRelation('');
    setPurpose('');
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const studentUserId = user?._id || user?.id;
      await api.post('/visitors', {
        name,
        phone,
        relation,
        studentUserId,
        purpose
      });
      setIsLogModalOpen(false);
      fetchStudentVisitors();
    } catch (err) {
      setError(err.message || 'Failed to lodge visitor details.');
    }
  };

  const handleCheckout = async (id) => {
    setError('');
    try {
      await api.put(`/visitors/${id}/checkout`, {});
      fetchStudentVisitors();
    } catch (err) {
      setError(err.message || 'Visitor checkout checkout logging failed.');
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Visitor Registration
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Pre-register your guests, parents, or friends before check-in.
          </p>
        </div>
        <button
          onClick={handleOpenLogModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition-transform active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Pre-register Guest</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Visitor logs grid */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-5">
          My Visitor Logs
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Fetching visitor registry records...
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No visitor log files registered. Click Pre-register Guest to log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Visitor Guest</th>
                  <th className="py-3.5 px-4">Relationship</th>
                  <th className="py-3.5 px-4">Purpose of Visit</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {visitors
                  .slice()
                  .reverse()
                  .map(vis => (
                    <tr key={vis._id || vis.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{vis.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{vis.phone}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-500">
                        {vis.relation}
                      </td>
                      <td className="py-4 px-4 text-slate-550 dark:text-slate-450">
                        {vis.purpose}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(vis.checkIn).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {vis.checkOut ? (
                          new Date(vis.checkOut).toLocaleString()
                        ) : (
                          <span className="text-cyan-500 flex items-center space-x-1 font-semibold">
                            <Clock size={12} className="animate-pulse" />
                            <span>Active Visit</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          vis.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                            : vis.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10'
                        }`}>
                          {vis.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!vis.checkOut && vis.status === 'approved' && (
                          <button
                            onClick={() => handleCheckout(vis._id || vis.id)}
                            className="text-[10px] font-semibold text-red-500 hover:underline"
                          >
                            Checkout Guest
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Visitor Modal */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Pre-register Guest entry">
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Guest Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Guest Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Relationship to Student</label>
            <input
              type="text"
              required
              placeholder="e.g. Father, Mother, Brother, Cousin, Friend"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Purpose of Visit</label>
            <input
              type="text"
              required
              placeholder="e.g. Submitting fees ledger, Local guardian weekend visit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98]"
          >
            Pre-register Guest
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentVisitors;
