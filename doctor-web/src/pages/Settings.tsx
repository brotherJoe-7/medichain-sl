import React, { useState, useRef } from 'react';
import { User, Shield, Key, Bell, Save, Building, Mail, Phone, Lock, Camera, Check } from 'lucide-react';

const HOSPITALS = [
  'Connaught Hospital, Freetown',
  'Bo Government Hospital',
  'Kenema Government Hospital',
  'Makeni Regional Hospital',
  'Princess Christian Maternity Hospital',
];

function load(key: string, fallback: string) {
  return localStorage.getItem(key) || fallback;
}

const Settings: React.FC = () => {
  const [name, setName] = useState(load('mc_profile_name', 'Dr. Sarah Jenkins'));
  const [specialty, setSpecialty] = useState(load('mc_profile_specialty', 'Cardiologist'));
  const [email, setEmail] = useState(load('mc_profile_email', 'sarah.jenkins@connaught.sl'));
  const [phone, setPhone] = useState(load('mc_profile_phone', '+232 76 123 456'));
  const [hospital, setHospital] = useState(load('mc_profile_hospital', 'Connaught Hospital, Freetown'));
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('mc_profile_avatar'));
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const walletId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
      localStorage.setItem('mc_profile_avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem('mc_profile_name', name);
    localStorage.setItem('mc_profile_specialty', specialty);
    localStorage.setItem('mc_profile_email', email);
    localStorage.setItem('mc_profile_phone', phone);
    localStorage.setItem('mc_profile_hospital', hospital);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure your doctor profile, security preferences, and blockchain identity.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /><span>Save Changes</span></>}
        </button>
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ✅ Profile saved successfully. Changes are reflected across the portal.
        </div>
      )}

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>

        {/* Profile Settings */}
        <div style={{ gridColumn: 'span 8', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <User size={24} color="var(--primary)" />
            <h3 className="heading-3" style={{ margin: 0 }}>Professional Profile</h3>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {/* Avatar upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                {avatar ? (
                  <img src={avatar} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
                    {initials}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                  <Camera size={14} color="white" />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }} onClick={() => fileRef.current?.click()}>
                Upload Photo
              </button>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Specialization</label>
                <input type="text" style={inputStyle} value={specialty} onChange={e => setSpecialty(e.target.value)} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email Address <Mail size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
                <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Phone Number <Phone size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
                <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Primary Hospital Affiliation <Building size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
            <select style={inputStyle} value={hospital} onChange={e => setHospital(e.target.value)}>
              {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59,130,246,0.15)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Bell size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Changes are saved locally to this session. In production, these will sync to your Fabric identity record.
          </div>
        </div>

        {/* Security & Blockchain */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Shield size={20} color="var(--primary)" />
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Blockchain Identity</h3>
            </div>

            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Hyperledger Fabric Node ID</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                {walletId}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>Connected to medichainchannel</span>
            </div>

            <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={16} /> Export Identity Certificate
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Lock size={20} color="var(--text-main)" />
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Security</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Two-Factor Auth</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Authenticator App</div>
                </div>
                <span className="status-badge status-completed">Enabled</span>
              </div>

              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Change Password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const formGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' };
const inputStyle: React.CSSProperties = {
  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
  fontSize: '0.95rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none', width: '100%'
};

export default Settings;
