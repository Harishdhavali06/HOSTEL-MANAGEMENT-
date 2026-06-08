import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { CreditCard, CreditCard as CardIcon, ShieldAlert } from 'lucide-react';

const StudentFees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // Form State
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [transactionId, setTransactionId] = useState('');

  const fetchStudentFees = async () => {
    try {
      const studentUserId = user?._id || user?.id;
      const data = await api.get(`/fees/student/${studentUserId}`);
      setFees(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve fee invoices list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentFees();
    }
  }, [user]);

  const handleOpenPayModal = (fee) => {
    setSelectedFee(fee);
    setPaymentMethod('card');
    setTransactionId('');
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/fees/${selectedFee._id || selectedFee.id}/pay`, {
        paymentMethod,
        transactionId
      });
      setIsPayModalOpen(false);
      fetchStudentFees();
    } catch (err) {
      setError(err.message || 'Failed to process payment logs.');
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Fee Ledger
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Review monthly invoices, download payment receipts, and pay outstanding amounts.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Invoices List */}
      <div className="glass-card p-6 rounded-2xl border shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
            Fetching personal billing statement...
          </div>
        ) : fees.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No fee invoice records found for your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Invoice Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Billing Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {fees.map(fee => (
                  <tr key={fee._id || fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                    <td className="py-4 px-4 font-semibold text-slate-750 dark:text-slate-200">
                      {fee.billingMonth}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100">
                      ${fee.amount}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
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
                    <td className="py-4 px-4 text-right">
                      {fee.status !== 'paid' ? (
                        <button
                          onClick={() => handleOpenPayModal(fee)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-[10px] shadow-sm hover:shadow active:scale-[0.98] transition-transform"
                        >
                          Checkout
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-500">Paid Receipted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Payment Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Checkout Invoice Payment">
        {selectedFee && (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex justify-between items-center text-xs">
              <div>
                <p className="text-slate-400">Billing Statement</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-1">{selectedFee.billingMonth}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Total Outstanding</p>
                <p className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mt-1">${selectedFee.amount}</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {['card', 'upi', 'bank_transfer', 'cash'].map(method => (
                  <label 
                    key={method}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      paymentMethod === method
                        ? 'border-cyan-500 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <CardIcon size={14} />
                    <span className="capitalize">{method.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Transaction ID / Reference Number</label>
              <input
                type="text"
                required
                placeholder="e.g. TXN10283082"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>Submit Payment</span>
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentFees;
