import React, { useState } from 'react';
import { QrCode, AlertTriangle, ShieldAlert, CheckCircle, Activity, User, Phone, Stethoscope } from 'lucide-react';

const ScanQR: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [emergencyData, setEmergencyData] = useState<any>(null);

  const simulateScan = () => {
    setScanning(true);
    // Simulate camera delay and blockchain verification
    setTimeout(async () => {
      try {
        const doctorId = localStorage.getItem('mc_wallet_address') || 'doctor_smith';
        
        // In a real scenario, this would send the scanned token to the backend
        // For the demo, we'll simulate the backend response after 2 seconds
        setTimeout(() => {
          setEmergencyData({
            patientId: 'PAT-10492',
            name: 'Alex Johnson',
            bloodType: 'O+',
            allergies: ['Penicillin', 'Peanuts'],
            medications: ['Lisinopril 10mg'],
            conditions: ['Hypertension'],
            emergencyContact: '+232 76 555 123 (Wife)',
            tokenExpiry: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleTimeString() // 4 hours from now
          });
          setScanning(false);
          setScanned(true);
        }, 1500);

      } catch (error) {
        console.error('Scan failed', error);
        setScanning(false);
      }
    }, 1000);
  };

  const resetScanner = () => {
    setScanned(false);
    setEmergencyData(null);
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title" style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={28} /> Emergency Break-Glass
          </h1>
          <p className="page-subtitle">Scan a patient's NFC wristband or QR code for life-saving emergency access.</p>
        </div>
      </div>

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        
        {/* Left Side: Scanner */}
        <div style={{ gridColumn: 'span 6', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 className="heading-3" style={{ margin: 0 }}>Scanner View</h3>
            <span className={`status-badge ${scanning ? 'status-upcoming' : scanned ? 'status-completed' : 'status-pending'}`}>
              {scanning ? 'Scanning...' : scanned ? 'Decrypted' : 'Ready'}
            </span>
          </div>

          <div style={{ 
            width: '100%', aspectRatio: '1', backgroundColor: '#000', borderRadius: 'var(--radius-lg)', 
            position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {!scanned && !scanning && (
              <div style={{ textAlign: 'center', color: '#64748B' }}>
                <QrCode size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Click below to simulate scanning a patient band</p>
              </div>
            )}
            
            {scanning && (
              <div style={{ textAlign: 'center', color: '#10B981' }}>
                <div className="scan-line-animation"></div>
                <Activity size={48} className="pulse-animation" style={{ margin: '0 auto 1rem' }} />
                <p>Decrypting NFC Token via Blockchain...</p>
              </div>
            )}

            {scanned && (
              <div style={{ textAlign: 'center', color: '#10B981', zIndex: 10 }}>
                <CheckCircle size={64} style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'white', margin: 0 }}>Access Granted</h3>
              </div>
            )}
            
            {/* Viewfinder brackets */}
            <div style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderTop: '4px solid #3B82F6', borderLeft: '4px solid #3B82F6' }}></div>
            <div style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderTop: '4px solid #3B82F6', borderRight: '4px solid #3B82F6' }}></div>
            <div style={{ position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, borderBottom: '4px solid #3B82F6', borderLeft: '4px solid #3B82F6' }}></div>
            <div style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderBottom: '4px solid #3B82F6', borderRight: '4px solid #3B82F6' }}></div>
          </div>

          <div style={{ marginTop: '2rem', width: '100%', display: 'flex', gap: '1rem' }}>
            {!scanned ? (
              <button className="btn-primary" style={{ flex: 1, backgroundColor: '#EF4444', justifyContent: 'center' }} onClick={simulateScan} disabled={scanning}>
                {scanning ? 'Authenticating...' : 'Simulate Band Scan'}
              </button>
            ) : (
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={resetScanner}>
                Reset Scanner
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Emergency Data Payload */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <ShieldAlert size={24} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#B91C1C', fontSize: '1.1rem' }}>Break-Glass Protocol Active</h3>
                <p style={{ fontSize: '0.85rem', color: '#991B1B', margin: 0, lineHeight: 1.5 }}>
                  This access bypasses patient mobile consent. An immutable audit log has been recorded on the Hyperledger Fabric blockchain. The patient and their next of kin have been notified via SMS. <strong>Access expires in 4 hours.</strong>
                </p>
              </div>
            </div>
          </div>

          {emergencyData ? (
            <div className="animate-fade-in" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid #10B981', padding: '2rem', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 className="heading-3" style={{ margin: 0, color: '#10B981' }}>Decrypted Payload</h3>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EF4444' }}>Expires: {emergencyData.tokenExpiry}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Patient Name</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16}/> {emergencyData.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Blood Type</label>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444', marginTop: '0.25rem' }}>{emergencyData.bloodType}</div>
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Critical Allergies</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {emergencyData.allergies.map((a: string) => (
                      <span key={a} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Current Medications / Conditions</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={16} color="var(--primary)"/> {emergencyData.conditions[0]}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} color="var(--primary)"/> {emergencyData.medications[0]}</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Emergency Contact</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} color="#10B981"/> {emergencyData.emergencyContact}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <ShieldAlert size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '250px' }}>Scan a patient's emergency band to decrypt their life-saving medical payload.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .scan-line-animation {
          width: 100%;
          height: 2px;
          background-color: #10B981;
          position: absolute;
          top: 0;
          left: 0;
          box-shadow: 0 0 10px #10B981;
          animation: scan 2s infinite linear;
        }
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .pulse-animation {
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { transform: scale(0.9); opacity: 0.7; }
          to { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ScanQR;
