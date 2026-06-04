import React, { useState, useEffect } from 'react';
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
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [doctorName, setDoctorName] = useState(() =>
    localStorage.getItem('mc_profile_name') ||
    localStorage.getItem('mc_doctor_id') ||
    'Dr. Sarah Jenkins'
  );
  const [doctorRole] = useState(() =>
    localStorage.getItem('mc_doctor_role') || 'Cardiologist'
  );

  // Sync doctor info on storage change
  useEffect(() => {
    const handler = () => {
      setDoctorName(
        localStorage.getItem('mc_profile_name') ||
        localStorage.getItem('mc_doctor_id') ||
        'Dr. Sarah Jenkins'
      );
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
    { id: 'patients',      label: 'My Patients',     icon: Users,           path: '/patients' },
    { id: 'appointments',  label: 'Appointments',    icon: Calendar,        path: '/appointments' },
    { id: 'records',       label: 'Medical Records', icon: FileText,        path: '/records' },
    { id: 'analytics',     label: 'Analytics',       icon: BarChart2,       path: '/analytics' },
    { id: 'scan-qr',       label: 'Scan QR Code',    icon: QrCode,          path: '/scan-qr' },
    { id: 'access-log',   label: 'Access Log',      icon: History,         path: '/access-log' },
    { id: 'notifications', label: 'Notifications',   icon: Bell,            path: '/notifications' },
    { id: 'profile',       label: 'Doctor Profile',  icon: UserCircle,      path: '/profile' },
    { id: 'settings',      label: 'Settings',        icon: Settings,        path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('mc_doctor_jwt');
    localStorage.removeItem('mc_doctor_id');
    localStorage.removeItem('mc_wallet_address');
    localStorage.removeItem('mc_profile_name');
    localStorage.removeItem('mc_doctor_role');
    setMobileOpen(false);
    navigate('/login');
    window.location.reload();
  };

  const initials = doctorName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="logo-container" style={{ marginBottom: 0 }}>
          <div className="logo-icon"><ShieldCheck size={22} /></div>
          <span className="logo-text">MediChain</span>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Logo — visible on desktop */}
        <div className="logo-container sidebar-logo-desktop">
          <div className="logo-icon"><ShieldCheck size={24} /></div>
          <span className="logo-text">MediChain Portal</span>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-item-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="user-profile">
          <div className="avatar">{initials || 'DR'}</div>
          <div className="user-info">
            <span className="user-name">{doctorName}</span>
            <span className="user-role">{doctorRole}</span>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
