import React from 'react';
import { User, Mail, Phone, MapPin, Award, Shield, FileText, Activity } from 'lucide-react';

const Profile: React.FC = () => {
  const doctor = {
    name: 'Dr. Sarah Jenkins',
    role: 'Senior Cardiologist',
    hospital: 'Connaught Hospital, Freetown',
    license: 'SL-MED-2024-9981',
    email: 's.jenkins@connaught.sl',
    phone: '+232 76 123 456',
    status: 'Verified by Ministry of Health (MoH)',
    wallet: '0x74a...8f2a',
    recordsNotarized: 142
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="heading-2 page-title">Doctor Profile</h1>
        <p className="page-subtitle">Manage your verified credentials and hospital affiliations</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Profile Card */}
        <div style={{ gridColumn: 'span 4', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100px', backgroundColor: 'var(--primary)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-40px', left: '2rem', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface)', border: '4px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80" alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={14} color="white" />
              <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>MoH Verified</span>
            </div>
          </div>
          
          <div style={{ padding: '3rem 2rem 2rem' }}>
            <h2 className="heading-3" style={{ marginBottom: '0.25rem' }}>{doctor.name}</h2>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{doctor.role}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapPin size={18} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{doctor.hospital}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail size={18} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{doctor.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Phone size={18} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{doctor.phone}</span>
              </div>
            </div>

            <button className="btn-outline" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Professional Details */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
            <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--primary)" /> Credential Verification
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Medical License Number</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {doctor.license} <Shield size={16} color="#10B981" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Verification Status</label>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: '#10B981', marginTop: '0.5rem' }}>
                  {doctor.status}
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem' }}>
            <h3 className="heading-3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--primary)" /> Blockchain Identity
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Fabric Wallet Address</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem', fontFamily: 'monospace', backgroundColor: 'var(--background)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  {doctor.wallet}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Records Notarized</label>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} /> {doctor.recordsNotarized}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
