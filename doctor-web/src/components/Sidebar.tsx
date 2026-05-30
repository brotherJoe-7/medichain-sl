import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  ShieldCheck,
  BarChart2,
  QrCode,
  History,
  Bell,
  UserCircle
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'patients', label: 'My Patients', icon: Users, path: '/patients' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
    { id: 'records', label: 'Medical Records', icon: FileText, path: '/records' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { id: 'scan-qr', label: 'Scan QR Code', icon: QrCode, path: '/scan-qr' },
    { id: 'access-log', label: 'Access Log', icon: History, path: '/access-log' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'profile', label: 'Doctor Profile', icon: UserCircle, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <ShieldCheck size={24} />
        </div>
        <span className="logo-text">MediChain Portal</span>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="user-profile">
        <div className="avatar">DR</div>
        <div className="user-info">
          <span className="user-name">Dr. Sarah Jenkins</span>
          <span className="user-role">Cardiologist</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
