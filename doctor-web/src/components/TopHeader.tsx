import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Wallet, Check, ChevronDown, LogOut } from 'lucide-react';
import { connectWallet, disconnectWallet } from '../services/blockchain';

// A global event bus so other components (like Records page) can receive the "New Record" click
export const emitNewRecord = () => window.dispatchEvent(new CustomEvent('mc:new-record'));

const TopHeader: React.FC = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState<string | null>(localStorage.getItem('mc_wallet_address'));
  const [doctorName, setDoctorName] = useState<string>(() =>
    localStorage.getItem('mc_profile_name') ||
    localStorage.getItem('mc_doctor_id') ||
    localStorage.getItem('mc_wallet_address') ||
    'Doctor'
  );
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      setAddress(localStorage.getItem('mc_wallet_address'));
      setDoctorName(
        localStorage.getItem('mc_profile_name') ||
        localStorage.getItem('mc_doctor_id') ||
        localStorage.getItem('mc_wallet_address') ||
        'Doctor'
      );
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleConnect = async () => {
    if (address) {
      setShowDropdown(v => !v);
      return;
    }
    setConnecting(true);
    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        localStorage.setItem('mc_wallet_address', result.address);
        window.location.reload();
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    localStorage.removeItem('mc_wallet_address');
    setAddress(null);
    setShowDropdown(false);
    window.location.reload();
  };

  const displayName = address
    ? (address.length > 12 ? `${address.substring(0, 8)}...` : address)
    : connecting ? 'Connecting…' : 'Connect Wallet';

  return (
    <header className="top-header">
      <div className="search-bar">
        <Search size={20} color="var(--text-muted)" />
        <input
          type="text"
          className="search-input"
          placeholder="Search patients, records, or ID..."
        />
      </div>

      <div className="header-actions">
        {/* Wallet connect button */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className={`wallet-btn ${address ? 'wallet-btn--connected' : ''}`}
            onClick={handleConnect}
            disabled={connecting}
          >
            <Wallet size={18} />
            <span>{displayName}</span>
            {address && <ChevronDown size={14} style={{ marginLeft: '2px', opacity: 0.7 }} />}
          </button>

          {showDropdown && address && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '220px',
              boxShadow: 'var(--shadow-lg)', zIndex: 100
            }}>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONNECTED AS</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{doctorName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>{address}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>
                <Check size={14} /> Hyperledger Fabric
              </div>
              <button
                onClick={handleDisconnect}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                  color: '#EF4444', fontSize: '0.9rem', fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem'
                }}
              >
                <LogOut size={16} /> Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="icon-btn" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          <span className="badge" />
        </button>

        {/* New Record */}
        <button className="btn-primary" id="new-record-btn" onClick={emitNewRecord}>
          <Plus size={18} />
          <span>New Record</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
