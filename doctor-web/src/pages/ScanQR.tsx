import React from 'react';

const ScanQR: React.FC = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="heading-2">Scan Patient QR Code</h1>
        <p className="text-muted">Instantly verify and access patient records securely</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', textAlign: 'center' }}>
        <div style={{ width: '250px', height: '250px', background: '#e2e8f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem' }}>
          <p className="text-muted">Camera Viewfinder</p>
        </div>
        <p style={{ marginTop: '1rem' }}>Position the patient's MediChain QR code inside the frame to request instant access to their medical history.</p>
      </div>
    </div>
  );
};

export default ScanQR;
