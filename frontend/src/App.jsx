import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar.jsx';
import CookieNotice from './components/CookieNotice.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DonorDashboard from './pages/DonorDashboard.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';
import NGODashboard from './pages/NGODashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Donate from './pages/Donate.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotificationHistory from './pages/NotificationHistory.jsx';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={['volunteer', 'ngo']}><Dashboard /></RoleProtectedRoute>} />
          <Route path="/dashboard/donor" element={<RoleProtectedRoute allowedRoles={['donor']}><DonorDashboard /></RoleProtectedRoute>} />
          <Route path="/dashboard/volunteer" element={<RoleProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></RoleProtectedRoute>} />
          <Route path="/dashboard/ngo" element={<RoleProtectedRoute allowedRoles={['ngo']}><NGODashboard /></RoleProtectedRoute>} />
          <Route path="/dashboard/admin" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="/donate" element={<RoleProtectedRoute allowedRoles={['donor', 'ngo']}><Donate /></RoleProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/notifications/history" element={<ProtectedRoute><NotificationHistory /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  const [cookiesAccepted, setCookiesAccepted] = React.useState(
    () => localStorage.getItem('cookiesAccepted') === 'true'
  );

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesAccepted(true);
  };

  return (
    <ThemeProvider>
      {!cookiesAccepted && (
        <div className="fixed inset-0 z-[10000] bg-gray-900/80 backdrop-blur-md flex items-center justify-center">
          <CookieNotice onAccept={handleAccept} />
        </div>
      )}
      {cookiesAccepted && (
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      )}
    </ThemeProvider>
  );
}

export default App;