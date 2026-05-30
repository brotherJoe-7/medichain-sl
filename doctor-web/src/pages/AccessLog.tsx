import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Loader } from 'lucide-react';
import { getAuditLog } from '../services/api';

const AccessLog: React.FC = () => {
  const [log, setLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const actorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAuditLog(actorId);
      setLog(data);
    } catch {
      setLog([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const actionColor: Record<string, string> = {
    ADD_RECORD: '#10B981', GRANT_ACCESS: '#3B82F6', REVOKE_ACCESS: '#EF4444',
    CREATE_PATIENT: '#8B5CF6', VIEW_RECORD: '#F59E0B',
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="heading-2 page-title">Access Audit Log</h1>
          <p className="page-subtitle">Immutable blockchain trail — all actions are permanently recorded on Hyperledger Fabric</p>
        </div>
        <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader size={24} style={{ margin: '0 auto 0.5rem' }} />
            <p>Querying Hyperledger Fabric audit chaincode…</p>
          </div>
        ) : log.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <History size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>No audit entries found for your account on the ledger yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th><th>Action</th><th>Actor</th><th>Subject</th><th>Details</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry: any, i) => (
                <tr key={entry.id || i}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                  </td>
                  <td>
                    <span style={{
                      background: `${actionColor[entry.action] || '#64748B'}18`,
                      color: actionColor[entry.action] || '#64748B',
                      padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600,
                    }}>{entry.action || '—'}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.actor || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{entry.subject || '—'}</td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{entry.details || '—'}</td>
                  <td>
                    <span className={`status-badge ${entry.status === 'success' ? 'status-completed' : 'status-upcoming'}`}>
                      {entry.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccessLog;
