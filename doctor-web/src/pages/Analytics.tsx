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
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingRecords: 0,
    syncRate: 0,
  });
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, auditLog] = await Promise.all([
        getDashboardStats(),
        getAuditLog(doctorId),
      ]);
      setStats(statsResponse);
      setActivity(auditLog.slice(0, 8));
    } catch (err: any) {
      setError(err?.message || 'Unable to load analytics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statCards = [
    { icon: Users, label: 'Total Patients', value: stats.totalPatients.toLocaleString(), sub: 'Patients on the ledger', color: '#3B82F6' },
    { icon: FileText, label: 'Today’s Appointments', value: stats.todayAppointments.toLocaleString(), sub: 'Scheduled visits', color: '#10B981' },
    { icon: Activity, label: 'Pending Records', value: stats.pendingRecords.toLocaleString(), sub: 'Awaiting notarization', color: '#F59E0B' },
    { icon: ShieldCheck, label: 'Sync Rate', value: `${stats.syncRate}%`, sub: 'Blockchain sync health', color: '#8B5CF6' },
  ];

  const formatActivity = (entry: AuditEntry) => {
    const date = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Just now';
    return {
      title: entry.action || 'Ledger event',
      subtitle: entry.details || 'No details available',
      time: date,
      actor: entry.actor || 'System',
      id: entry.id || `${entry.actor}-${date}`,
    };
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="heading-2 page-title">Analytics</h1>
          <p className="page-subtitle">Live platform health and audit trends from the MediChain backend.</p>
        </div>
        <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#991B1B', padding: '1rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid" style={{ gap: '1.5rem' }}>
        <div className="stats-row">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div className="stat-card" key={i}>
                <div className={`stat-icon-wrapper ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div className="stat-value">{loading ? '—' : card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>{card.sub}</div>
              </div>
            );
          })}
        </div>

        <div style={{ gridColumn: 'span 12', display: 'grid', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 className="heading-3" style={{ margin: 0 }}>Recent Ledger Activity</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>Audit trail entries from your doctor identity.</p>
              </div>
            </div>

            {loading ? (
              <p className="page-subtitle">Loading audit history…</p>
            ) : activity.length === 0 ? (
              <p className="page-subtitle">No recent ledger events found for this account.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {activity.map((entry) => {
                  const item = formatActivity(entry);
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{item.title}</div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.subtitle}</p>
                      </div>
                      <div style={{ minWidth: '120px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <div>{item.time}</div>
                        <div style={{ marginTop: '0.35rem' }}>Actor: {item.actor}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
