import React from 'react';

const Notifications: React.FC = () => {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="heading-2">Notifications</h1>
        <p className="text-muted">Alerts, access request approvals, and system updates</p>
      </div>
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
        <p>You have no new notifications.</p>
      </div>
    </div>
  );
};

export default Notifications;
