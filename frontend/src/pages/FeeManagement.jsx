import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Form State
  const [selectedStudentUserId, setSelectedStudentUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [billingMonth, setBillingMonth] = useState('');

  const fetchData = async () => {
    try {
      const feesData = await api.get('/fees');
      setFees(feesData);

      const studentsData = await api.get('/students');
      setStudents(studentsData);

      const summaryData = await api.get('/fees/summary');
      setSummary(summaryData);
    } catch (err) {
      setError(err.message || 'Failed to retrieve fee collections records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenInvoiceModal = () => {
    setSelectedStudentUserId('');
    setAmount('');
    setDueDate('');
    
    // Default billing month to current Month & Year
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date();
    setBillingMonth(`${months[d.getMonth()]} ${d.getFullYear()}`);
    
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/fees/invoice', {
        studentUserId: selectedStudentUserId,
        amount: Number(amount),
        dueDate,
        billingMonth
      });
      setIsInvoiceModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to generate invoice.');
    }
  };

  // Filter invoices
  const filteredFees = fees.filter(fee => {
    const q = searchQuery.toLowerCase();
    return (
      fee.student?.name?.toLowerCase().includes(q) ||
      fee.student?.email?.toLowerCase().includes(q) ||
      fee.billingMonth?.toLowerCase().includes(q) ||
      fee.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hostel Fee Management
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Track student fee payments, pending dues, and generate monthly billing invoices.
          </p>
        </div>
        <button
          onClick={handleOpenInvoiceModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition-transform active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Generate Invoice</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Numerical collections widgets */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-5 rounded-2xl border flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">${summary.totalRevenue || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Dues</p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">${summary.totalPending || 0}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Invoices Count</p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {summary.paidCount || 0} / {summary.totalInvoices || 0}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl">
              <FileText size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Invoice Search & Logs Table */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        <div className="flex items-center space-x-3 w-full max-w-md mb-6 p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice by student name, month, or billing status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs focus:outline-none text-slate-800 dark:text-slate-200"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Fetching billing records...
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredFees.map(fee => (
                  <tr key={fee._id || fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{fee.student?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fee.student?.email}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-650 dark:text-slate-350">
                      {fee.billingMonth}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      ${fee.amount}
                    </td>
                    <td className="py-4 px-4 text-slate-550 dark:text-slate-450">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-400 capitalize">
                      {fee.paymentMethod || '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                      {fee.transactionId || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        fee.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/10'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Generate Fee Invoice">
        <form onSubmit={handleInvoiceSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Student</label>
            <select
              required
              value={selectedStudentUserId}
              onChange={(e) => {
                setSelectedStudentUserId(e.target.value);
                // Pre-fill student room rent amount if room exists
                const stud = students.find(s => s.user?._id === e.target.value || s.user === e.target.value || s.user?.id === e.target.value);
                if (stud && stud.room) {
                  setAmount(stud.room.rentPerMonth || '');
                }
              }}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-350"
            >
              <option value="">-- Choose Student --</option>
              {students
                .filter(s => s.status === 'active')
                .map(s => (
                  <option key={s._id || s.id} value={s.user?._id || s.user?.id || s.user}>
                    {s.user?.name} (ID: {s.studentId} {s.room ? `• Room ${s.room.roomNumber}` : '• No Room'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Billing Month</label>
            <input
              type="text"
              required
              placeholder="e.g. June 2026"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Billing Amount ($)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500 text-slate-350"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98]"
          >
            Issue Invoice
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;
