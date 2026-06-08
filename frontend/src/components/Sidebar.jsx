import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Bed,
  CreditCard,
  CalendarCheck,
  AlertCircle,
  UserCheck,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const menuItems = isAdmin
    ? [
        { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/students', icon: Users },
        { name: 'Rooms', path: '/rooms', icon: Bed },
        { name: 'Fees Tracker', path: '/fees', icon: CreditCard },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Complaints', path: '/complaints', icon: AlertCircle },
        { name: 'Visitors Log', path: '/visitors', icon: UserCheck },
      ]
    : [
        { name: 'My Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
        { name: 'My Profile', path: '/profile', icon: Users },
        { name: 'My Fees', path: '/student-fees', icon: CreditCard },
        { name: 'Attendance', path: '/student-attendance', icon: CalendarCheck },
        { name: 'My Complaints', path: '/student-complaints', icon: AlertCircle },
        { name: 'Visitor Registry', path: '/student-visitors', icon: UserCheck },
      ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 glass-nav text-slate-800 dark:text-slate-200 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">
            HostelHub
          </span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            {user?.role}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 transform flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              HostelHub
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user?.role}
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">
              {user?.name}
            </h4>
            <p className="text-[11px] truncate text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-4 border-cyan-500 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-cyan-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Desktop Theme toggle inside Sidebar */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold">
              {isDarkMode ? 'dark' : 'light'}
            </span>
          </button>

          {/* Logout Action */}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}
    </>
  );
};

export default Sidebar;
