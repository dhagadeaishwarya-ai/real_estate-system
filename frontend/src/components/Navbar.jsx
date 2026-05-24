import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Compass, Calculator, Calendar, LayoutDashboard, LogOut, LogIn, Menu, X, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isAgent, isSeller } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isHost = isAdmin || isAgent || isSeller;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '0',
      zIndex: 1000,
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      margin: '0 0 2rem 0',
      padding: '1rem 2rem',
      background: 'rgba(11, 15, 25, 0.8)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          <span style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Home size={20} />
          </span>
          <span className="glow-text">NovaReal</span>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/listings" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">
            <Compass size={16} /> Explore
          </Link>
          <Link to="/calculator" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">
            <Calculator size={16} /> EMI Calculator
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/bookings" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">
                <Calendar size={16} /> Visit Bookings
              </Link>
              {isHost && (
                <Link to="/add-property" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">
                  <PlusCircle size={16} /> Add Listing
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.95rem', fontWeight: 500 }} className="nav-link">
                  <LayoutDashboard size={16} /> Console
                </Link>
              )}
            </>
          )}
        </div>

        {/* Authentication Options */}
        <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                <span className={`badge ${
                  user.role === 'admin' ? 'badge-error' :
                  user.role === 'agent' ? 'badge-success' :
                  user.role === 'seller' ? 'badge-warning' : 'badge-info'
                }`} style={{ fontSize: '0.7rem', padding: '0.05rem 0.4rem' }}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="outline-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Link to="/login" className="outline-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <LogIn size={14} /> Login
              </Link>
              <Link to="/register" className="gradient-btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button className="mobile-toggle" onClick={toggleMobileMenu} style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          display: 'none'
        }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <Link to="/listings" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Compass size={18} /> Explore Properties
          </Link>
          <Link to="/calculator" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Calculator size={18} /> EMI Calculator
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                <Calendar size={18} /> Visit Bookings
              </Link>
              {isHost && (
                <Link to="/add-property" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                  <PlusCircle size={18} /> Add Listing
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                  <LayoutDashboard size={18} /> Console
                </Link>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.5rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: '0.5rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <button onClick={handleLogout} className="outline-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="outline-btn" style={{ justifyContent: 'center' }}>
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="gradient-btn" style={{ justifyContent: 'center' }}>
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive Inline Styles for clean layout compatibility */}
      <style>{`
        .nav-link {
          color: var(--text-muted);
        }
        .nav-link:hover {
          color: var(--primary-color);
        }
        @media (max-width: 768px) {
          .desktop-menu, .desktop-auth {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>

    </nav>
  );
};

export default Navbar;
