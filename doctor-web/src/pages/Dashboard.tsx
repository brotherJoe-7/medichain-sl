import React, { useEffect, useState } from 'react';
import { Users, Calendar, FileText, Activity, TrendingUp, RefreshCw } from 'lucide-react';
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

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const load = async () => {
    setLoading(true);
    try {
      const [health, s, log] = await Promise.all([
        checkHealth(),
        getDashboardStats(),
        getAuditLog(doctorId),
      ]);
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
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'blue' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'green' },
    { label: 'Pending Records', value: stats.pendingRecords, icon: FileText, color: 'orange' },
    { label: 'On-chain Sync Rate', value: `${stats.syncRate}%`, icon: Activity, color: 'purple', trend: stats.syncRate >= 95 },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Blockchain Status Pill */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '999px',
            fontSize: '0.85rem', fontWeight: 600,
            background: blockchainStatus === 'live' ? 'rgba(16,185,129,0.1)' : blockchainStatus === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)',
            color: blockchainStatus === 'live' ? '#10B981' : blockchainStatus === 'error' ? '#EF4444' : '#64748B',
            border: `1px solid ${blockchainStatus === 'live' ? '#10B981' : blockchainStatus === 'error' ? '#EF4444' : '#94A3B8'}`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {blockchainStatus === 'live' ? 'Hyperledger Fabric — Live' : blockchainStatus === 'error' ? 'Blockchain Offline' : 'Connecting…'}
          </span>
          <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {loading && (
        <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Loading live blockchain data…</p>
      )}

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="stats-row">
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
                      <TrendingUp size={16} /> {card.trend ? 'Good' : 'Low'}
                    </span>
                  )}
                </div>
                <div className="stat-label">{card.label}</div>
              </div>
            );
          })}
        </div>

        <div className="activity-area" style={{ gridColumn: 'span 12' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Blockchain Activity</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Immutable audit trail from Hyperledger Fabric</span>
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
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Just now'} · Actor: {entry.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
