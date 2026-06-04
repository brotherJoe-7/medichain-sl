import React, { useEffect, useState } from 'react';
import { Users, FileText, Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import { getDashboardStats, getAuditLog } from '../services/api';

interface DashboardStats {
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

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, todayAppointments: 0, pendingRecords: 0, syncRate: 0 });
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, auditLog] = await Promise.all([getDashboardStats(), getAuditLog(doctorId)]);
      setStats(statsResponse);
      setActivity(auditLog.slice(0, 8));
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Unable to load analytics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { icon: Users,       label: 'Total Patients',       value: stats.totalPatients.toLocaleString(),    sub: 'Patients on the ledger',    color: 'blue' },
    { icon: FileText,    label: "Today's Appointments",  value: stats.todayAppointments.toLocaleString(), sub: 'Scheduled visits',          color: 'green' },
    { icon: Activity,    label: 'Pending Records',       value: stats.pendingRecords.toLocaleString(),   sub: 'Awaiting notarization',     color: 'orange' },
    { icon: ShieldCheck, label: 'Sync Rate',             value: `${stats.syncRate}%`,                    sub: 'Blockchain sync health',    color: 'purple' },
  ];

  return (
    <div className="page-container animate-fade-in">

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="heading-2 page-title">Analytics</h1>
          <p className="page-subtitle">Live platform health and audit trends from the MediChain backend.</p>
        </div>
        <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#991B1B', padding: '1rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div className="stat-card" key={i}>
              <div className={`stat-icon-wrapper ${card.color}`}>
                <Icon size={24} />
              </div>
              <div className="stat-value">{loading ? '—' : card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Audit Activity ── */}
      <div className="activity-area">
        <div className="card-header">
          <h3 className="card-title">Recent Ledger Activity</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audit trail from your doctor identity</span>
        </div>

        {loading ? (
          <p className="page-subtitle">Loading audit history…</p>
        ) : activity.length === 0 ? (
          <p className="page-subtitle">No recent ledger events found for this account.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activity.map((entry, i) => {
              const date = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Just now';
              return (
                <div key={entry.id || i} className="audit-row">
                  <div className="audit-row__main">
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {entry.action || 'Ledger event'}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {entry.details || 'No details available'}
                    </p>
                  </div>
                  <div className="audit-row__meta">
                    <div>{date}</div>
                    <div style={{ marginTop: '0.25rem', opacity: 0.7 }}>Actor: {entry.actor}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
