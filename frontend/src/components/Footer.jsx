import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-panel" style={{
      marginTop: '4rem',
      borderRadius: '16px 16px 0 0',
      borderBottom: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      background: 'rgba(11, 15, 25, 0.95)',
      padding: '3rem 2rem 1.5rem 2rem'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        
        {/* Brand Summary */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
            <span style={{
              background: 'var(--accent-gradient)',
              color: 'white',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex'
            }}>
              <Home size={18} />
            </span>
            <span className="glow-text">NovaReal</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Discover and manage premium properties effortlessly. Our platform connects buyers, sellers, and certified agents in a fully secure, beautiful interface.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Certified Safe Platform
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)' }} className="footer-link">Home Page</Link></li>
            <li><Link to="/listings" style={{ color: 'var(--text-muted)' }} className="footer-link">Property Listings</Link></li>
            <li><Link to="/calculator" style={{ color: 'var(--text-muted)' }} className="footer-link">EMI Loan Calculator</Link></li>
            <li><Link to="/register" style={{ color: 'var(--text-muted)' }} className="footer-link">Register Account</Link></li>
          </ul>
        </div>

        {/* Support details */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>Contact Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} style={{ color: 'var(--primary-color)' }} /> <span>+1 (555) NOVA-REAL</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} style={{ color: 'var(--primary-color)' }} /> <span>support@novareal.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--primary-color)' }} /> <span>100 Innovation Way, Suite A, NY</span>
            </li>
          </ul>
        </div>

      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '1.5rem auto 0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div>&copy; {new Date().getFullYear()} NovaReal. Designed for Sem 4 Projects. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
        </div>

        <style>{`
          .footer-link:hover {
            color: var(--primary-color) !important;
            transform: translateX(3px);
          }
        `}</style>
      </div>
    </footer>
  );
};

export default Footer;
