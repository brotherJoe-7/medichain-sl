import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
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

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        
        <main className="main-content">
          <TopHeader />
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/records" element={<Records />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/scan-qr" element={<ScanQR />} />
            <Route path="/access-log" element={<AccessLog />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
