import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Activity, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getDashboardStats, getAuditLog, checkHealth } from '../services/api';

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  pendingRecords: number;
  syncRate: number;
}

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  details: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalPatients: 0, todayAppointments: 0, pendingRecords: 0, syncRate: 0 });
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [blockchainStatus, setBlockchainStatus] = useState<'checking' | 'live' | 'error'>('checking');
  const [loading, setLoading] = useState(true);

  const doctorId = localStorage.getItem('mc_doctor_id') || localStorage.getItem('mc_wallet_address') || '';

  const load = async () => {
    setLoading(true);
    try {
      const auditPromise = doctorId ? getAuditLog(doctorId) : Promise.resolve([] as AuditEntry[]);
      const [health, s, log] = await Promise.all([checkHealth(), getDashboardStats(), auditPromise]);
      setBlockchainStatus(health.status === 'OK' ? 'live' : 'error');
      setStats(s);
      setActivity(log.slice(0, 6));
    } catch {
      setBlockchainStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: 'Total Patients',       value: stats.totalPatients,       icon: Users,     color: 'blue' },
    { label: "Today's Appointments", value: stats.todayAppointments,   icon: Calendar,  color: 'green' },
    { label: 'Pending Records',      value: stats.pendingRecords,      icon: FileText,  color: 'orange' },
    { label: 'On-chain Sync',        value: `${stats.syncRate}%`,      icon: Activity,  color: 'purple', trend: stats.syncRate >= 95 },
  ];

  const statusColor = blockchainStatus === 'live' ? '#10B981' : blockchainStatus === 'error' ? '#EF4444' : '#94A3B8';
  const statusBg   = blockchainStatus === 'live' ? 'rgba(16,185,129,0.1)' : blockchainStatus === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)';
  const statusLabel = blockchainStatus === 'live' ? 'Hyperledger Fabric — Live' : blockchainStatus === 'error' ? 'Blockchain Offline' : 'Connecting…';

  return (
    <div className="page-container">

      {/* ── Page Header ── */}
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <span className="blockchain-pill" style={{ color: statusColor, background: statusBg, border: `1px solid ${statusColor}` }}>
            <span className="blockchain-dot" style={{ background: statusColor }} />
            {statusLabel}
          </span>
          <button className="btn-outline" onClick={load}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && (
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Loading live blockchain data…</p>
      )}

      {/* ── Stat Cards ── */}
      <div className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div className="stat-card" key={i}>
              <div className={`stat-icon-wrapper ${card.color}`}>
                <Icon size={24} />
              </div>
              <div className="stat-value">
                {loading ? '—' : card.value}
                {card.trend !== undefined && !loading && (
                  <span className={`stat-trend ${card.trend ? 'positive' : 'negative'}`}>
                    {card.trend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {card.trend ? 'Good' : 'Low'}
                  </span>
                )}
              </div>
              <div className="stat-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Blockchain Activity ── */}
      <div className="activity-area animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Blockchain Activity</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Immutable audit trail</span>
        </div>
        {activity.length === 0 && !loading ? (
          <p className="page-subtitle">No recent activity found on the ledger for your account.</p>
        ) : (
          <div className="activity-feed">
            {activity.map((entry, i) => (
              <div className="activity-item" key={entry.id || i}>
                <div className="activity-icon">
                  <FileText size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>{entry.action}</strong> — {entry.details}
                  </p>
                  <span className="activity-time">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Just now'} · {entry.actor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
