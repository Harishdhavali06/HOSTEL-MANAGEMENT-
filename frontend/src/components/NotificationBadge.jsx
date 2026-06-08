import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBadge = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadList = notifications.filter(
    n => !n.readBy?.some(id => id.toString() === (user?._id || user?.id || '').toString())
  );
  
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? { ...n, readBy: [...(n.readBy || []), user?._id || user?.id] }
            : n
        )
      );
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
      >
        <Bell size={20} />
        {unreadList.length > 0 && (
          <span className="absolute top-[-2px] right-[-2px] min-h-5 min-w-5 flex items-center justify-center bg-red-500 text-[10px] text-white font-extrabold rounded-full px-1 shadow border border-white dark:border-slate-900">
            {unreadList.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100 glass-card">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-900">
            <h4 className="font-bold text-sm">Announcements & Alerts</h4>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-400">
              {notifications.length} total
            </span>
          </div>

          <div className="mt-2.5 space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active announcements
              </div>
            ) : (
              notifications.map(n => {
                const isRead = n.readBy?.some(id => id.toString() === (user?._id || user?.id || '').toString());
                return (
                  <div
                    key={n._id || n.id}
                    className={`p-2.5 rounded-xl border text-left transition flex items-start space-x-2.5 ${
                      isRead
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-900'
                        : 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/10 dark:border-indigo-500/20'
                    }`}
                  >
                    <div className="mt-0.5 text-indigo-500 dark:text-indigo-400">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h5 className="font-semibold text-xs text-slate-850 dark:text-slate-200 truncate">
                          {n.title}
                        </h5>
                        {!isRead && (
                          <button
                            onClick={() => handleMarkAsRead(n._id || n.id)}
                            className="p-0.5 rounded hover:bg-indigo-500/10 text-indigo-500 hover:text-indigo-600 transition"
                            title="Mark as Read"
                          >
                            <Check size={11} />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
