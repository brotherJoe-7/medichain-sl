import React from 'react';
import { User, Shield, Key, Bell, Save, Building, Mail, Phone, Lock } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure your doctor profile, security preferences, and blockchain identity.</p>
        </div>
        <button className="btn-primary">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        
        {/* Profile Settings */}
        <div style={{ gridColumn: 'span 8', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <User size={24} color="var(--primary)" />
            <h3 className="heading-3" style={{ margin: 0 }}>Professional Profile</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
                SJ
              </div>
              <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>Upload Photo</button>
            </div>
            
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" style={inputStyle} defaultValue="Dr. Sarah Jenkins" />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Specialization</label>
                <input type="text" style={inputStyle} defaultValue="Cardiologist" />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Email Address <Mail size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
                <input type="email" style={inputStyle} defaultValue="sarah.jenkins@connaught.sl" />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Phone Number <Phone size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
                <input type="tel" style={inputStyle} defaultValue="+232 76 123 456" />
              </div>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Primary Hospital Affiliation <Building size={14} style={{ display: 'inline', marginLeft: '4px', opacity: 0.5 }} /></label>
            <select style={inputStyle} defaultValue="connaught">
              <option value="connaught">Connaught Hospital, Freetown</option>
              <option value="bo">Bo Government Hospital</option>
              <option value="kenema">Kenema Government Hospital</option>
              <option value="makeni">Makeni Regional Hospital</option>
            </select>
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
                doctor_smith_7f2a...91b
              </p>
            </div>
            
            <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={16} /> Export Private Key
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
  fontSize: '0.95rem', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' 
};

export default Settings;
