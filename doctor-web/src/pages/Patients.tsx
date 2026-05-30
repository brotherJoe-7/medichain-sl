import React, { useEffect, useState } from 'react';
import { Search, UserPlus, MoreVertical, Filter, X, AlertCircle, Loader } from 'lucide-react';
import { getPatients, createPatient, type PatientPayload } from '../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

const emptyForm = (): PatientPayload => ({
  id: 'PAT-' + Date.now(),
  name: '', age: 0, gender: 'Male', dob: '', phone: '', email: '',
  address: '', bloodType: 'O+', condition: '', allergies: [], medications: [], notes: '',
  doctorId: localStorage.getItem('mc_wallet_address') || 'doctor_smith',
});

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<PatientPayload[]>([]);
  const [filtered, setFiltered] = useState<PatientPayload[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PatientPayload>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [medInput, setMedInput] = useState('');

  const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPatients(doctorId);
      setPatients(data);
      setFiltered(data);
    } catch {
      setPatients([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.condition?.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    ));
  }, [search, patients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Patient name is required.'); return; }
    if (!form.dob) { setFormError('Date of birth is required.'); return; }
    if (!form.phone.trim()) { setFormError('Phone number is required.'); return; }

    setSubmitting(true);
    try {
      const result = await createPatient(form);
      setSuccessMsg(`Patient registered! Blockchain Tx: ${result.txHash}`);
      setShowForm(false);
      setForm(emptyForm());
      await load();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = (field: 'allergies' | 'medications', val: string, setter: (v: string) => void) => {
    if (!val.trim()) return;
    setForm(f => ({ ...f, [field]: [...f[field], val.trim()] }));
    setter('');
  };

  const removeTag = (field: 'allergies' | 'medications', index: number) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">My Patients</h1>
          <p className="page-subtitle">
            {loading ? 'Loading from blockchain…' : `${filtered.length} patient${filtered.length !== 1 ? 's' : ''} on the ledger`}
          </p>
        </div>
        <button className="btn-primary" id="add-patient-btn" onClick={() => { setShowForm(true); setForm(emptyForm()); setFormError(''); }}>
          <UserPlus size={18} /><span>Register Patient</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="table-filters animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-bar table-search">
          <Search size={18} color="var(--text-muted)" />
          <input id="patient-search" type="text" className="search-input" placeholder="Search by name, ID, or condition…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-outline"><Filter size={18} /><span>Filter</span></button>
      </div>

      <div className="table-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader size={24} style={{ margin: '0 auto 0.5rem' }} />
            <p>Querying Hyperledger Fabric ledger…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>{search ? 'No patients match your search.' : 'No patients registered yet. Click "Register Patient" to begin.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th><th>Age / Gender</th><th>Phone</th><th>Blood Type</th><th>Condition</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="table-cell-user">
                      <div className="avatar-sm">{p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.age} / {p.gender}</td>
                  <td>{p.phone}</td>
                  <td><span className="condition-tag">{p.bloodType}</span></td>
                  <td><span className="condition-tag">{p.condition || '—'}</span></td>
                  <td><span className="status-dot active" /><span style={{ color: '#10B981', fontWeight: 600 }}>Active</span></td>
                  <td><button className="icon-btn-sm"><MoreVertical size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Patient Registration Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '1rem', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="heading-3">Register New Patient</h2>
              <button className="icon-btn-sm" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <fieldset style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <legend style={{ fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-main)' }}>Personal Information</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={labelStyle}>
                    Full Name *
                    <input id="patient-name" style={inputStyle} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mohamed Kamara" />
                  </label>
                  <label style={labelStyle}>
                    Date of Birth *
                    <input id="patient-dob" type="date" style={inputStyle} required value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value, age: new Date().getFullYear() - new Date(e.target.value).getFullYear() }))} />
                  </label>
                  <label style={labelStyle}>
                    Gender *
                    <select id="patient-gender" style={inputStyle} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </label>
                  <label style={labelStyle}>
                    Blood Type *
                    <select id="patient-bloodtype" style={inputStyle} value={form.bloodType} onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}>
                      {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </label>
                </div>
              </fieldset>

              <fieldset style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <legend style={{ fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-main)' }}>Contact Details</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={labelStyle}>
                    Phone Number *
                    <input id="patient-phone" style={inputStyle} required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+232 XX XXX XXXX" />
                  </label>
                  <label style={labelStyle}>
                    Email
                    <input id="patient-email" type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="patient@email.com" />
                  </label>
                  <label style={{ ...labelStyle, gridColumn: 'span 2' }}>
                    Home Address
                    <input id="patient-address" style={inputStyle} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. 12 Wilberforce St, Freetown" />
                  </label>
                </div>
              </fieldset>

              <fieldset style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <legend style={{ fontWeight: 600, padding: '0 0.5rem', color: 'var(--text-main)' }}>Medical Information</legend>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={labelStyle}>
                    Primary Condition / Reason for Visit
                    <input id="patient-condition" style={inputStyle} value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} placeholder="e.g. Hypertension, Malaria, Routine Checkup" />
                  </label>
                  <label style={labelStyle}>
                    Known Allergies
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input id="patient-allergy-input" style={{ ...inputStyle, flex: 1 }} value={allergyInput} onChange={e => setAllergyInput(e.target.value)} placeholder="Add allergy and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('allergies', allergyInput, setAllergyInput); } }} />
                      <button type="button" className="btn-outline" onClick={() => addTag('allergies', allergyInput, setAllergyInput)}>Add</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {form.allergies.map((a, i) => (
                        <span key={i} style={{ background: 'rgba(239,68,68,0.1)', color: '#B91C1C', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {a} <button type="button" onClick={() => removeTag('allergies', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C' }}>×</button>
                        </span>
                      ))}
                    </div>
                  </label>
                  <label style={labelStyle}>
                    Current Medications
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input id="patient-med-input" style={{ ...inputStyle, flex: 1 }} value={medInput} onChange={e => setMedInput(e.target.value)} placeholder="Add medication and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('medications', medInput, setMedInput); } }} />
                      <button type="button" className="btn-outline" onClick={() => addTag('medications', medInput, setMedInput)}>Add</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {form.medications.map((m, i) => (
                        <span key={i} style={{ background: 'rgba(59,130,246,0.1)', color: '#1D4ED8', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {m} <button type="button" onClick={() => removeTag('medications', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8' }}>×</button>
                        </span>
                      ))}
                    </div>
                  </label>
                  <label style={labelStyle}>
                    Clinical Notes
                    <textarea id="patient-notes" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes for this patient…" />
                  </label>
                </div>
              </fieldset>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button id="submit-patient-btn" type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><Loader size={16} /> Registering on Blockchain…</> : <><UserPlus size={16} /> Register Patient</>}
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

export default Patients;
