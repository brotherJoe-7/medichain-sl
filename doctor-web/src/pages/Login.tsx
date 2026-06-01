import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import { loginDoctor } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!doctorId.trim() || !password.trim()) {
      setError('Doctor ID and password are required.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await loginDoctor(doctorId.trim(), password);
      localStorage.setItem('mc_doctor_jwt', response.token);
      localStorage.setItem('mc_doctor_id', response.doctorId);
      localStorage.setItem('mc_profile_name', response.name);
      setDoctorId('');
      setPassword('');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>MediChain</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>Doctor Portal Login</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Doctor ID
            </label>
            <input
              type="text"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              placeholder="e.g., doctor_smith"
              autoComplete="username"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                border: error ? '1px solid #EF4444' : '1px solid var(--border)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '0.75rem',
                border: error ? '1px solid #EF4444' : '1px solid var(--border)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#991B1B', padding: '0.875rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !doctorId.trim() || !password.trim()}
            style={{
              width: '100%',
              padding: '0.95rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              backgroundColor: loading || !doctorId.trim() || !password.trim() ? 'var(--text-muted)' : 'var(--primary)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading || !doctorId.trim() || !password.trim() ? 0.6 : 1,
            }}
          >
            <LogIn size={18} /> {loading ? 'Signing in…' : 'Sign in as Doctor'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Secure login using blockchain-verified credentials.
        </p>
      </div>
    </div>
  );
};

export default Login;
