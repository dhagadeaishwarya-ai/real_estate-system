import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !role) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '70vh', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
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
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join NovaReal's luxury estate ecosystem
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="alert-box alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} style={{ color: 'var(--primary-color)' }} /> Full Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} style={{ color: 'var(--primary-color)' }} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} style={{ color: 'var(--primary-color)' }} /> Password
            </label>
            <input 
              type="password" 
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label>Select User Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
              style={{ background: '#1b2336', cursor: 'pointer' }}
            >
              <option value="buyer">Buyer (I want to buy properties & book visits)</option>
              <option value="seller">Seller (I own properties and want to list them)</option>
              <option value="agent">Real Estate Agent (I represent multiple properties)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="gradient-btn" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Create Account'}
          </button>
        </form>

        {/* Redirect Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            Login here
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

export default Register;
