import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, AlertTriangle, ShieldAlert, CheckCircle, Activity, User, Phone, Stethoscope, RefreshCw } from 'lucide-react';
// html5-qrcode is an optional dependency for camera scanning
// @ts-ignore
const Html5Qrcode = require('html5-qrcode').Html5Qrcode;

import { verifyQr } from '../services/api';

const ScanQR: React.FC = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [doctorToken, setDoctorToken] = useState<string | null>(localStorage.getItem('mc_doctor_jwt'));
  const [doctorId, setDoctorId] = useState<string>(localStorage.getItem('mc_doctor_id') || localStorage.getItem('mc_wallet_address') || 'doctor_smith');
  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const refresh = () => {
      setDoctorToken(localStorage.getItem('mc_doctor_jwt'));
      setDoctorId(localStorage.getItem('mc_doctor_id') || localStorage.getItem('mc_wallet_address') || 'doctor_smith');
    };

    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const verifyToken = async (token: string) => {
    if (!doctorToken) {
      navigate('/login');
      return;
    }

    if (!token) {
      setError('Please provide a valid QR token or scan a band.');
      return;
    }

    setError(null);
    setScanning(true);

    try {
      const response = await verifyQr(token, doctorId);
      if (response?.success) {
        setEmergencyData(response.payload);
        setScanned(true);
      } else {
        setError('Verification failed. The token may be expired.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed.');
    } finally {
      setScanning(false);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    }
  };

  const startScan = async () => {
    if (!doctorToken) {
      navigate('/login');
      return;
    }

    setError(null);
    setScanned(false);
    setEmergencyData(null);
    setScanning(true);

    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
      }

      const html5Qr = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 160, height: 160 },
          aspectRatio: 1,
          verbose: false,
        },
        async (decodedText: string) => {
          try {
            await html5Qr.pause();
            await verifyToken(decodedText);
          } catch (scanError) {
            console.error('verifyQr failed', scanError);
            setError('Unable to verify scanned token.');
          }
        },
        (scanError: any) => {
          console.debug('QR scan status', scanError);
        }
      );
    } catch (scanFail) {
      console.error('Scan failed', scanFail);
      setError('Camera unavailable or permission denied. Paste token below instead.');
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      await scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const resetScanner = async () => {
    await stopScan();
    setScanned(false);
    setEmergencyData(null);
    setError(null);
    setManualToken('');
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title" style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={28} /> Emergency Break-Glass
          </h1>
          <p className="page-subtitle">Scan a patient's NFC wristband or paste a signed QR token for emergency access.</p>
        </div>
      </div>

      <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div style={{ gridColumn: 'span 6', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 className="heading-3" style={{ margin: 0 }}>Scanner View</h3>
            <span className={`status-badge ${scanning ? 'status-upcoming' : scanned ? 'status-completed' : 'status-pending'}`}>
              {scanning ? 'Scanning…' : scanned ? 'Decrypted' : 'Ready'}
            </span>
          </div>

          <div style={{ width: '100%', maxWidth: '420px', minHeight: '420px', backgroundColor: '#000', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div id="qr-reader" style={{ width: '100%', height: '100%' }} />

            {!scanned && !scanning && (
              <div style={{ position: 'absolute', textAlign: 'center', color: '#94A3B8' }}>
                <QrCode size={64} style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
                <p>Start camera scan or paste a patient QR token below.</p>
              </div>
            )}

            {scanning && (
              <div style={{ position: 'absolute', textAlign: 'center', color: '#10B981' }}>
                <div className="scan-line-animation" />
                <Activity size={48} className="pulse-animation" style={{ margin: '0 auto 1rem' }} />
                <p>Decrypting token…</p>
              </div>
            )}

            {scanned && emergencyData && (
              <div style={{ position: 'absolute', textAlign: 'center', color: '#10B981', zIndex: 10 }}>
                <CheckCircle size={64} style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'white', margin: 0 }}>Access Granted</h3>
              </div>
            )}
          </div>

          {error && (
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#9B1C1C', padding: '1rem', borderRadius: '0.75rem' }}>
              {error}
            </div>
          )}

          <div style={{ width: '100%', maxWidth: '420px', display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={startScan} disabled={scanning}>
                <RefreshCw size={16} /> Start Camera Scan
              </button>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={resetScanner}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="manual-qr" style={{ fontWeight: 600, color: 'var(--text-main)' }}>Manual token entry</label>
              <input
                id="manual-qr"
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste signed QR token here"
                style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '0.85rem 1rem', fontSize: '0.95rem', color: 'var(--text-main)', backgroundColor: 'var(--bg-color)' }}
              />
              <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => verifyToken(manualToken)} disabled={scanning || !manualToken}>
                Verify Token
              </button>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <ShieldAlert size={24} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#B91C1C', fontSize: '1.1rem' }}>Break-Glass Protocol Active</h3>
                <p style={{ fontSize: '0.85rem', color: '#991B1B', margin: 0, lineHeight: 1.5 }}>
                  This access bypasses patient mobile consent in life-saving situations. All access is audited on Hyperledger Fabric and expires after 4 hours.
                </p>
              </div>
            </div>
          </div>

          {emergencyData ? (
            <div className="animate-fade-in" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid #10B981', padding: '2rem', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 className="heading-3" style={{ margin: 0, color: '#10B981' }}>Decrypted Payload</h3>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EF4444' }}>{emergencyData.tokenExpiry || 'Expires soon'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Patient Name</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> {emergencyData.name || 'Unknown'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Blood Type</label>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444', marginTop: '0.25rem' }}>{emergencyData.bloodType || 'Unknown'}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Critical Allergies</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {(emergencyData.allergies || []).map((a: string) => (
                      <span key={a} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Current Medications / Conditions</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-main)', fontWeight: 500, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={16} color="var(--primary)" /> {emergencyData.conditions?.[0] || 'Not listed'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} color="var(--primary)" /> {emergencyData.medications?.[0] || 'Not listed'}</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Emergency Contact</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} color="#10B981" /> {emergencyData.emergencyContact || 'Not available'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <ShieldAlert size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '250px' }}>Scan a patient's emergency band or paste a signed token to decrypt their life-saving medical payload.</p>
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
