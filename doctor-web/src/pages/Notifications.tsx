import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, FileText, UserCheck, AlertTriangle, CheckCircle, X, Clock, RefreshCw } from 'lucide-react';
import { getAuditLog } from '../services/api';

interface Notification {
  id: string;
  type: 'emergency' | 'access_request' | 'record_update' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const typeConfig = {
  emergency: { icon: ShieldAlert, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', label: 'Emergency' },
  access_request: { icon: UserCheck, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', label: 'Access' },
  record_update: { icon: FileText, color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', label: 'Record' },
  system: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', label: 'System' },
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const mapAuditEntry = (entry: any, index: number): Notification => {
    const action = String(entry.action || '').toUpperCase();
    const details = String(entry.details || entry.message || 'No additional details');
    const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Just now';

    let type: Notification['type'] = 'system';
    if (action.includes('QR') || action.includes('EMERGENCY')) type = 'emergency';
    else if (action.includes('GRANT') || action.includes('ACCESS')) type = 'access_request';
    else if (action.includes('RECORD') || action.includes('ADD_RECORD')) type = 'record_update';

    return {
      id: entry.id || `audit-${index}`,
      type,
      title: action || 'Ledger Event',
      message: details,
      time: timestamp,
      read: false,
    };
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await getAuditLog(doctorId);
      setNotifications(entries.map(mapAuditEntry));
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

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
          <p className="page-subtitle">Alerts, access requests, and audit events from the ledger.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}>
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </button>
          <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button className="btn-primary" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Loading notifications from the audit log…</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '0.75rem', padding: '1rem', color: '#991B1B', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {!loading && displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Bell size={48} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
          <h3 className="heading-3" style={{ color: 'var(--text-muted)' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-muted)' }}>No notifications were returned by the audit service.</p>
        </div>
      ) : null}

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
              {!n.read && (
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: 8, height: 8, borderRadius: '50%', backgroundColor: cfg.color }} />
              )}

              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <cfg.icon size={22} color={cfg.color} />
              </div>

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
              </div>

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
    </div>
  );
};

export default Notifications;
