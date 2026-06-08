import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  GraduationCap,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student Register form state
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState('CSE');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const studentData = {
      name,
      email,
      password,
      studentId,
      phone,
      parentName,
      parentPhone,
      address,
      branch
    };

    try {
      await register(studentData);
      navigate('/student-dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoCredentials = (role) => {
    setErrorMsg('');
    if (role === 'admin') {
      setIsAdminMode(true);
      setIsRegisterMode(false);
      setEmail('admin@hostel.com');
      setPassword('adminpassword123');
    } else {
      setIsAdminMode(false);
      setIsRegisterMode(false);
      setEmail('alice@test.com');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 relative overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Floating Theme Toggle (External) */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-lg glass-card p-8 rounded-3xl border border-slate-700/30 shadow-2xl relative z-10 bg-slate-950/60 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <GraduationCap className="text-white" size={26} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mt-4">
            HostelHub Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Manage allocations, fees, logs, and complaints seamlessly
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {!isRegisterMode && (
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/60 mb-6">
            <button
              onClick={() => {
                setIsAdminMode(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                !isAdminMode
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => {
                setIsAdminMode(true);
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isAdminMode
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Portal
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Forms Container */}
        {isRegisterMode ? (
          // Register form for student
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-center text-slate-200 mb-2">
              New Student Registration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Student ID / Roll No"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors text-slate-300"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="ME">ME</option>
                  <option value="EE">EE</option>
                  <option value="CE">CE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Parent Name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Parent Phone"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
                />
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              <input
                type="text"
                required
                placeholder="Full Home Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-semibold tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Sign Up'}</span>
              <ArrowRight size={14} />
            </button>

            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMsg('');
                }}
                className="text-cyan-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          // Login form for admin or student
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500 text-slate-200"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500 text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-semibold tracking-wider bg-gradient-to-r from-cyan-500 to-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Validating credentials...' : `Sign In as ${isAdminMode ? 'Admin' : 'Student'}`}</span>
              <ArrowRight size={14} />
            </button>

            {/* Quick Demo Autofills */}
            <div className="pt-4 border-t border-slate-900/80 mt-2 flex flex-col items-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Demo Accounts Quick-Fill
              </span>
              <div className="flex space-x-3 text-[10px]">
                <button
                  type="button"
                  onClick={() => autofillDemoCredentials('admin')}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-semibold"
                >
                  Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => autofillDemoCredentials('student')}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 font-semibold"
                >
                  Student Demo
                </button>
              </div>
            </div>

            {!isAdminMode && (
              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                New student?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMsg('');
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  Create Account
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
