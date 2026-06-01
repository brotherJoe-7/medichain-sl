import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginDoctor } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: '1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Card Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
        }}>
          {/* Header Background */}
          <div style={{
            backgroundColor: 'var(--primary)',
            padding: '3rem 2rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              backdropFilter: 'blur(10px)',
            }}>
              <ShieldCheck size={36} color="white" />
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'white',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.5px',
            }}>MediChain</h1>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              fontWeight: 500,
            }}>Doctor Portal</p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} style={{
            padding: '2.5rem 2rem',
          }}>
            {/* Error Alert */}
            {error && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}>
                <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#991B1B',
                    fontWeight: 600,
                  }}>Login Failed</p>
                  <p style={{
                    margin: '0.25rem 0 0',
                    fontSize: '0.85rem',
                    color: '#B91C1C',
                    lineHeight: 1.5,
                  }}>{error}</p>
                </div>
              </div>
            )}

            {/* Doctor ID Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '0.625rem',
                letterSpacing: '0.3px',
              }}>
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
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  border: error && !doctorId ? '2px solid #EF4444' : '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#1F2937',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  fontWeight: 500,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error && !doctorId ? '#EF4444' : '#E5E7EB';
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '0.625rem',
                letterSpacing: '0.3px',
              }}>
                Password
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 1rem',
                    paddingRight: '2.75rem',
                    borderRadius: '8px',
                    border: error && !password ? '2px solid #EF4444' : '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    fontWeight: 500,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = error && !password ? '#EF4444' : '#E5E7EB';
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    background: 'none',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B7280',
                    transition: 'color 0.2s ease',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !doctorId.trim() || !password.trim()}
              style={{
                width: '100%',
                padding: '0.95rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: loading || !doctorId.trim() || !password.trim()
                  ? '#D1D5DB'
                  : 'var(--primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading || !doctorId.trim() || !password.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading || !doctorId.trim() || !password.trim()
                  ? 'none'
                  : '0 4px 15px rgba(0, 0, 0, 0.1)',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                if (!loading && doctorId.trim() && password.trim()) {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && doctorId.trim() && password.trim()) {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            padding: '1.5rem 2rem',
            backgroundColor: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '0.8rem',
              color: '#6B7280',
              margin: 0,
              letterSpacing: '0.2px',
            }}>
              Secure login using blockchain-verified credentials
            </p>
          </div>
        </div>

        {/* Demo Hint (optional, for development) */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: '#6B7280',
          letterSpacing: '0.2px',
        }}>
          Demo: Use <span style={{ fontWeight: 600 }}>doctor_smith</span> / <span style={{ fontWeight: 600 }}>password</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

