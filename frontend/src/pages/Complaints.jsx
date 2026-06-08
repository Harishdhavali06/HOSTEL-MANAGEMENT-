import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { AlertTriangle, Clock, CheckCircle, Edit2, ShieldAlert } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form State
  const [status, setStatus] = useState('pending');
  const [remarks, setRemarks] = useState('');

  const fetchComplaints = async () => {
    try {
      const data = await api.get('/complaints');
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve complaints logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenResolveModal = (comp) => {
    setSelectedComplaint(comp);
    setStatus(comp.status || 'pending');
    setRemarks(comp.remarks || '');
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/complaints/${selectedComplaint._id || selectedComplaint.id}/resolve`, {
        status,
        remarks
      });
      setIsResolveModalOpen(false);
      fetchComplaints();
    } catch (err) {
      setError(err.message || 'Failed to update ticket.');
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Complaints Resolution Panel
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Resolve student complaints, update tracking progress, and add details.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Complaints Table */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Fetching complaint tickets...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No complaints filed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Complaint Title</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Filed Date</th>
                  <th className="py-3.5 px-4">Resolution Note</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {complaints
                  .slice()
                  .reverse()
                  .map(comp => (
                    <tr key={comp._id || comp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{comp.student?.name || 'Student'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{comp.student?.email}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-750 dark:text-slate-250">
                        {comp.title}
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate text-slate-450" title={comp.description}>
                        {comp.description}
                      </td>
                      <td className="py-4 px-4 capitalize font-semibold text-slate-500">
                        {comp.category}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(comp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 italic max-w-xs truncate text-slate-400" title={comp.remarks}>
                        {comp.remarks || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          comp.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                            : comp.status === 'in_progress'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10'
                        }`}>
                          {comp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenResolveModal(comp)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 transition"
                          title="Update Status"
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve Complaint Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Update Complaint Ticket">
        {selectedComplaint && (
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Ticket: {selectedComplaint.title}</p>
              <p className="text-slate-400 mt-1">{selectedComplaint.description}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-350"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Resolution Comments / Remarks</label>
              <textarea
                rows={3}
                placeholder="Details of the resolution action..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500 resize-none text-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98]"
            >
              Update Ticket
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
