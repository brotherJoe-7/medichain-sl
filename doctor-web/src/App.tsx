import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import ScanQR from './pages/ScanQR';
import Login from './pages/Login';
import AccessLog from './pages/AccessLog';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import './App.css';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">
      <TopHeader />
      {children}
    </main>
  </div>
);

// Layout wrapper for login page
const LoginLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-container login-container">
    <main className="main-content login-content">
      {children}
    </main>
  </div>
);

function App() {
  const doctorToken = localStorage.getItem('mc_doctor_jwt');

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route
          path="/login"
          element={<LoginLayout><Login /></LoginLayout>}
        />

        {/* Root path: redirect to dashboard if authenticated, otherwise to login */}
        <Route
          path="/"
          element={doctorToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Patients />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Appointments />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Records />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Analytics />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/scan-qr"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <ScanQR />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/access-log"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <AccessLog />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Notifications />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Profile />
                </AuthenticatedLayout>
              }
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              element={
                <AuthenticatedLayout>
                  <Settings />
                </AuthenticatedLayout>
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
