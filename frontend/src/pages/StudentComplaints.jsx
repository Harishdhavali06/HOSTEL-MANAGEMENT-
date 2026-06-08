import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { AlertTriangle, Plus, ClipboardList, Info } from 'lucide-react';

const StudentComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('plumbing');

  const fetchStudentComplaints = async () => {
    try {
      const studentUserId = user?._id || user?.id;
      const data = await api.get(`/complaints/student/${studentUserId}`);
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your complaints tickets list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentComplaints();
    }
  }, [user]);

  const handleOpenLodgeModal = () => {
    setTitle('');
    setDescription('');
    setCategory('plumbing');
    setIsLodgeModalOpen(true);
  };

  const handleLodgeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/complaints', {
        title,
        description,
        category
      });
      setIsLodgeModalOpen(false);
      fetchStudentComplaints();
    } catch (err) {
      setError(err.message || 'Failed to lodge complaint ticket.');
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Support & Complaints
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            File support tickets for maintenance, catering, or internet complaints.
          </p>
        </div>
        <button
          onClick={handleOpenLodgeModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition-transform active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Lodge Complaint</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Complaints list card */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Fetching ticket history...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No complaints logged. Click Lodge Complaint if you need assistance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Complaint Title</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Filed Date</th>
                  <th className="py-3.5 px-4">Resolution Note</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {complaints
                  .slice()
                  .reverse()
                  .map(c => (
                    <tr key={c._id || c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                      <td className="py-4 px-4 font-semibold text-slate-750 dark:text-slate-200">
                        {c.title}
                      </td>
                      <td className="py-4 px-4 text-slate-500 max-w-xs truncate" title={c.description}>
                        {c.description}
                      </td>
                      <td className="py-4 px-4 capitalize font-semibold text-slate-500">
                        {c.category}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-slate-450 italic max-w-xs truncate" title={c.remarks}>
                        {c.remarks || <span className="text-[10px] text-slate-400 italic">Pending inspection</span>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          c.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                            : c.status === 'in_progress'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lodge Complaint Modal */}
      <Modal isOpen={isLodgeModalOpen} onClose={() => setIsLodgeModalOpen(false)} title="Lodge Support Ticket">
        <form onSubmit={handleLodgeSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-350"
            >
              <option value="plumbing">Plumbing (Leakage, Water taps)</option>
              <option value="electrical">Electrical (Lights, Fan, Switch)</option>
              <option value="food">Catering / Food Service</option>
              <option value="cleanliness">Room / Corridor Cleanliness</option>
              <option value="internet">Wi-Fi / Internet connection</option>
              <option value="security">Security & Access</option>
              <option value="other">Other issue</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Brief Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Fan in Room 204 not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact details of the issue so the maintenance crew can address it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500 resize-none text-slate-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98]"
          >
            Lodge Support Ticket
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentComplaints;
