import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { loginDoctor } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('doctor_smith');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await loginDoctor(doctorId.trim(), password);
      localStorage.setItem('mc_doctor_jwt', response.token);
      localStorage.setItem('mc_doctor_id', response.doctorId);
      localStorage.setItem('mc_profile_name', response.name);
      navigate('/scan-qr');
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <div>
          <h1 className="heading-2 page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={28} /> Doctor Login
          </h1>
          <p className="page-subtitle">Sign in with your doctor credentials to authorize emergency access.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="auth-card animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Doctor ID</label>
          <input
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="form-input"
            placeholder="doctor_smith"
            autoComplete="username"
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-input"
            placeholder="password"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>
        )}

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in as Doctor'}
        </button>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>Return Home</button>
          <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => navigate('/scan-qr')}>Scan without login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
