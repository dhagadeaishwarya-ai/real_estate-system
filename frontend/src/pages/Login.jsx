import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide all credentials.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '60vh', padding: '1rem' }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        background: 'var(--bg-card)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{
            width: '50px',
            height: '50px',
            background: 'var(--accent-gradient)',
            color: 'white',
            borderRadius: '12px',
            margin: '0 auto 1rem auto'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Access your premium property console
          </p>
        </div>

        {/* Errors Block */}
        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} style={{ color: 'var(--primary-color)' }} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="e.g. buyer@realestate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} style={{ color: 'var(--primary-color)' }} /> Secure Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button 
            type="submit" 
            className="gradient-btn" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>

        {/* Redirect */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>

      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
