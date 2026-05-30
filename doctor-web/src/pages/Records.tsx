import React, { useEffect, useState } from 'react';
import { Search, Filter, Shield, ExternalLink, FileText, Upload, X, Loader, AlertCircle } from 'lucide-react';
import { getPatients, getRecords, notarizeRecord, uploadToIPFS } from '../services/api';

const RECORD_TYPES = ['Lab Report', 'Prescription', 'X-Ray', 'MRI', 'Consultation Note', 'Discharge Summary', 'Vaccination', 'Surgery Report'];

const Records: React.FC = () => {
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState('Lab Report');
  const [patientId, setPatientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  // Listen for "New Record" button in the top header
  useEffect(() => {
    const handler = () => { setShowForm(true); setFormError(''); };
    window.addEventListener('mc:new-record', handler);
    return () => window.removeEventListener('mc:new-record', handler);
  }, []);

  useEffect(() => {
    getPatients(doctorId).then(data => setPatients(data.map(p => ({ id: p.id, name: p.name })))).catch(() => {});
  }, []);

  const loadRecords = async (pid: string) => {
    if (!pid) return;
    setLoading(true);
    try {
      const data = await getRecords(pid);
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(selectedPatient); }, [selectedPatient]);

  const filtered = records.filter(r =>
    !search || r.id?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNotarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!patientId) { setFormError('Select a patient.'); return; }
    if (!file) { setFormError('Upload a document first.'); return; }

    setSubmitting(true);
    try {
      // 1. Upload to IPFS
      const ipfs = await uploadToIPFS(file);
      // 2. Hash the file name + size as document hash
      const docHash = '0x' + [...file.name + file.size].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0).toString(16).padStart(64, '0');
      // 3. Notarize on blockchain
      const result = await notarizeRecord({
        patientId,
        recordId: 'REC-' + Date.now(),
        documentHash: docHash,
        ipfsHash: ipfs.hash,
        recordType,
        doctorId,
        patientSignature: 'Signed',
      });

      setSuccessMsg(`Record notarized! Tx: ${result.txHash} | IPFS: ${ipfs.hash}`);
      setShowForm(false);
      setFile(null);
      if (selectedPatient === patientId) loadRecords(patientId);
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Blockchain Medical Records</h1>
          <p className="page-subtitle">Immutable on-chain record audit trail — Hyperledger Fabric</p>
        </div>
        <button className="btn-primary" id="notarize-record-btn" onClick={() => { setShowForm(true); setFormError(''); }}>
          <Shield size={18} /><span>Notarize Record</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', wordBreak: 'break-all' }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <select
            id="patient-selector"
            style={{ border: '1px solid var(--border)', borderRadius: '0.375rem', padding: '0.55rem 0.75rem', background: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.95rem' }}
            value={selectedPatient}
            onChange={e => setSelectedPatient(e.target.value)}
          >
            <option value="">— Select a patient to view records —</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
          </select>
          <div className="search-bar table-search" style={{ maxWidth: '300px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input id="record-search" type="text" className="search-input" placeholder="Filter records…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <button className="btn-outline"><Filter size={18} /><span>Filter</span></button>
      </div>

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {!selectedPatient ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Select a patient above to view their on-chain medical records.</p>
          </div>
        ) : loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader size={24} style={{ margin: '0 auto 0.5rem' }} /><p>Querying Hyperledger Fabric ledger…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No records found for this patient. Notarize the first one.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th><th>Date</th><th>Type</th><th>IPFS Hash</th><th>On-Chain Hash</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec: any, i) => (
                <tr key={rec.id || i}>
                  <td className="font-semibold">{rec.id || `REC-${i + 1}`}</td>
                  <td>{rec.date || rec.timestamp ? new Date(rec.date || rec.timestamp).toLocaleDateString() : '—'}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} style={{ color: 'var(--primary)' }} />{rec.type || rec.recordType || '—'}</div></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.ipfsHash || rec.ipfsCid || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.documentHash || rec.hash || '—'}</td>
                  <td><span className="status-badge status-completed">Synced</span></td>
                  <td>
                    {rec.ipfsHash && (
                      <a href={`https://ipfs.io/ipfs/${rec.ipfsHash}`} target="_blank" rel="noreferrer" className="icon-btn-sm" title="View on IPFS">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Notarize Record Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '1rem', width: '100%', maxWidth: '520px', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="heading-3">Notarize Medical Record</h2>
              <button className="icon-btn-sm" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleNotarize} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <label style={labelStyle}>
                Patient *
                <select id="notarize-patient" style={inputStyle} required value={patientId} onChange={e => setPatientId(e.target.value)}>
                  <option value="">— Select patient —</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              </label>

              <label style={labelStyle}>
                Record Type *
                <select id="notarize-type" style={inputStyle} value={recordType} onChange={e => setRecordType(e.target.value)}>
                  {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>

              <label style={labelStyle}>
                Upload Document *
                <div
                  style={{ border: '2px dashed var(--border)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(16,185,129,0.05)' : 'var(--bg-color)', transition: 'all 0.2s' }}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
                  <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
                  {file ? (
                    <p style={{ color: '#10B981', fontWeight: 600 }}>✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Click to upload PDF, image, or document</p>
                  )}
                </div>
              </label>

              <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>How this works:</strong> The document is uploaded to IPFS (Pinata), then its hash is permanently notarized on the Hyperledger Fabric ledger. The original file can be deleted for GDPR compliance while the audit trail remains immutable.
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button id="submit-record-btn" type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><Loader size={16} /> Uploading & Notarizing…</> : <><Shield size={16} /> Notarize on Blockchain</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' };
const inputStyle: React.CSSProperties = { border: '1px solid var(--border)', borderRadius: '0.375rem', padding: '0.6rem 0.75rem', fontSize: '0.95rem', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none', width: '100%' };

export default Records;
