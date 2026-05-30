import React from 'react';

const AccessLog: React.FC = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="heading-2">Access Audit Log</h1>
        <p className="text-muted">Immutable blockchain trail of all your patient record interactions</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
        <p>No access logs found for your profile today. Every time you query a patient's data, an immutable record is stored on the Hyperledger Fabric ledger.</p>
      </div>
    </div>
  );
};

export default AccessLog;
