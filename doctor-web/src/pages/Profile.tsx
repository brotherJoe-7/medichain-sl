import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="heading-2">Doctor Profile</h1>
        <p className="text-muted">Manage your verified credentials and hospital affiliations</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
        <h3 className="heading-3">Dr. Sarah Jenkins</h3>
        <p className="text-muted">Cardiologist • Connaught Hospital, Freetown</p>
        <p style={{ marginTop: '1rem' }}><strong>Status:</strong> Verified by Ministry of Health (MoH)</p>
        <p><strong>License:</strong> SL-MED-2024-9981</p>
      </div>
    </div>
  );
};

export default Profile;
