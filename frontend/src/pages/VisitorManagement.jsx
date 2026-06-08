import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LogOut, UserCheck, Clock, UserX, XCircle, CheckCircle } from 'lucide-react';

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVisitors = async () => {
    try {
      const data = await api.get('/visitors');
      setVisitors(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve visitor log database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCheckout = async (id) => {
    setError('');
    try {
      await api.put(`/visitors/${id}/checkout`, {});
      fetchVisitors();
    } catch (err) {
      setError(err.message || 'Visitor check-out checkout logged failed.');
    }
  };

  const handleUpdateStatus = async (id, statusVal) => {
    setError('');
    try {
      await api.put(`/visitors/${id}/status`, { status: statusVal });
      fetchVisitors();
    } catch (err) {
      setError(err.message || 'Failed to update approval status.');
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Visitor Entry Logger
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Log guest entries, approve student visitor requests, and check out active visitors.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Visitor logs grid */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Fetching visitor entry logs...
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No visitor logs registered today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Visitor</th>
                  <th className="py-3.5 px-4">Relation</th>
                  <th className="py-3.5 px-4">Visiting Student</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Status</th>
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
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-350">{vis.student?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{vis.student?.email}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-550 dark:text-slate-450">
                        {vis.purpose}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(vis.checkIn).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {vis.checkOut ? (
                          new Date(vis.checkOut).toLocaleString()
                        ) : (
                          <span className="text-cyan-500 flex items-center space-x-1 font-semibold">
                            <Clock size={12} className="animate-pulse" />
                            <span>Inside Campus</span>
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
                        <div className="flex items-center justify-end space-x-2">
                          {vis.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(vis._id || vis.id, 'approved')}
                                className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition"
                                title="Approve Visit"
                              >
                                <CheckCircle size={13} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(vis._id || vis.id, 'rejected')}
                                className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition"
                                title="Reject Visit"
                              >
                                <XCircle size={13} />
                              </button>
                            </>
                          )}
                          {!vis.checkOut && vis.status === 'approved' && (
                            <button
                              onClick={() => handleCheckout(vis._id || vis.id)}
                              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold transition"
                              title="Checkout Visitor"
                            >
                              <LogOut size={11} />
                              <span>Checkout</span>
                            </button>
                          )}
                        </div>
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

export default VisitorManagement;
