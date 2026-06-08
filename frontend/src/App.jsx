import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentManagement from './pages/StudentManagement';
import RoomManagement from './pages/RoomManagement';
import FeeManagement from './pages/FeeManagement';
import StudentFees from './pages/StudentFees';
import Attendance from './pages/Attendance';
import StudentAttendance from './pages/StudentAttendance';
import Complaints from './pages/Complaints';
import StudentComplaints from './pages/StudentComplaints';
import VisitorManagement from './pages/VisitorManagement';
import StudentVisitors from './pages/StudentVisitors';
import StudentProfile from './pages/StudentProfile';

// Protected Layout wrapper
const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <span className="text-sm font-semibold animate-pulse">Initializing Portal Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <main className="flex-1 lg:pl-64 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

// Route access validation based on user roles
const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
  }

  return <Outlet />;
};

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <span className="text-sm font-semibold animate-pulse">Checking Session Cache...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/student-dashboard'} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Private Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              
              {/* Default Index Route */}
              <Route path="/" element={<RootRedirect />} />

              {/* Admin-only Routes */}
              <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/students" element={<StudentManagement />} />
                <Route path="/fees" element={<FeeManagement />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/visitors" element={<VisitorManagement />} />
              </Route>

              {/* Student-only Routes */}
              <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/student-fees" element={<StudentFees />} />
                <Route path="/student-attendance" element={<StudentAttendance />} />
                <Route path="/student-complaints" element={<StudentComplaints />} />
                <Route path="/student-visitors" element={<StudentVisitors />} />
              </Route>

              {/* Shared Routes (Visible to both Student and Admin) */}
              <Route path="/rooms" element={<RoomManagement />} />

            </Route>

            {/* Fallback wildcard */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
