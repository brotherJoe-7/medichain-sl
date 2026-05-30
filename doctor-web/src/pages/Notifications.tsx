import React, { useState } from 'react';
import { Bell, ShieldAlert, FileText, UserCheck, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'emergency' | 'access_request' | 'record_update' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  patientName?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'emergency', read: false,
    title: 'Emergency Break-Glass Triggered',
    message: 'Dr. K. Kamara accessed patient PAT-8821 via emergency band scan at Connaught Hospital.',
    time: '2 min ago', patientName: 'Mohamed Jalloh'
  },
  {
    id: 'n2', type: 'access_request', read: false,
    title: 'Record Access Requested',
    message: 'Dr. Aminata Diallo (Radiology, Connaught) is requesting access to the medical history of Patient PAT-1029.',
    time: '18 min ago', patientName: 'Femi Koroma'
  },
  {
    id: 'n3', type: 'record_update', read: false,
    title: 'Record Notarized on Blockchain',
    message: 'Blood test report for Patient PAT-3341 was successfully notarized. TX: 0x74a...8f2a',
    time: '1 hr ago', patientName: 'Isata Sesay'
  },
  {
    id: 'n4', type: 'system', read: true,
    title: 'Blockchain Sync Complete',
    message: 'Hyperledger Fabric network sync completed. All 1,847 patient records verified.',
    time: '3 hrs ago'
  },
  {
    id: 'n5', type: 'access_request', read: true,
    title: 'Access Request Approved',
    message: 'Patient PAT-2218 (Hawa Bangura) approved your request to access their full medical history.',
    time: '5 hrs ago', patientName: 'Hawa Bangura'
  },
];

const typeConfig = {
  emergency: { icon: ShieldAlert, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', label: 'Emergency' },
  access_request: { icon: UserCheck, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', label: 'Access' },
  record_update: { icon: FileText, color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', label: 'Record' },
  system: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', label: 'System' },
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="heading-2 page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={26} /> Notifications
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '999px' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">Alerts, access requests, and system updates</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn-outline"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button className="btn-primary" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Bell size={48} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
          <h3 className="heading-3" style={{ color: 'var(--text-muted)' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No unread notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayed.map((n, i) => {
            const cfg = typeConfig[n.type];
            return (
              <div
                key={n.id}
                className="animate-fade-in hover-lift"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
                  backgroundColor: n.read ? 'var(--surface)' : cfg.bg,
                  border: `1px solid ${n.read ? 'var(--border)' : cfg.border}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onClick={() => markRead(n.id)}
              >
                {/* Unread dot */}
                {!n.read && (
                  <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.color }} />
                )}

                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <cfg.icon size={22} color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} /> {n.time}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                  {n.type === 'access_request' && !n.read && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', flexShrink: 0, marginTop: '2px' }}
                >
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
