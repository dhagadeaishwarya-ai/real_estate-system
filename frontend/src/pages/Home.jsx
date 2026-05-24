import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Search, Compass, Building, ShieldCheck, ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await propertyAPI.getAll({ availability: 'available' });
        // Take the first 3 listings as featured
        setFeatured(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?location=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/listings');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* 1. Glassmorphic Hero Banner Section */}
      <header className="glass-panel" style={{
        padding: '5rem 2.5rem',
        borderRadius: '24px',
        textAlign: 'center',
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05)), var(--bg-glass)',
        marginBottom: '4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Abstract floating circles for wow factor */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'var(--primary-color)',
          filter: 'blur(120px)',
          opacity: 0.15,
          top: '-10%',
          right: '-5%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'var(--secondary-color)',
          filter: 'blur(120px)',
          opacity: 0.1,
          bottom: '-10%',
          left: '-5%',
          pointerEvents: 'none'
        }} />

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
          lineHeight: '1.15',
          marginBottom: '1.5rem',
          maxWidth: '850px'
        }}>
          Discover Your Dream <span className="glow-text">Premium Real Estate</span>
        </h1>
        
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '650px',
          lineHeight: '1.7',
          marginBottom: '2.5rem'
        }}>
          NovaReal is a premier, fully-integrated ecosystem connecting discerning buyers with luxurious properties, elite brokers, and seamless visit bookings.
        </p>

        {/* Dynamic Search Box */}
        <form onSubmit={handleSearchSubmit} className="glass-panel" style={{
          display: 'flex',
          background: 'rgba(11, 15, 25, 0.6)',
          borderRadius: '9999px',
          padding: '0.5rem 0.5rem 0.5rem 1.5rem',
          width: '100%',
          maxWidth: '600px',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid rgba(255,255,255,0.12)'
        }}>
          <Search size={20} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Search by city or location (e.g. California, Texas, New York)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              width: '100%',
              fontSize: '0.95rem'
            }}
          />
          <button type="submit" className="gradient-btn" style={{
            borderRadius: '9999px',
            padding: '0.65rem 1.5rem',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}>
            Find Properties
          </button>
        </form>

      </header>

      {/* 2. Platform Key Features Grid */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Why Choose <span className="glow-text">NovaReal</span>?</h2>
          <p style={{ color: 'var(--text-muted)' }}>Experience real estate transaction standards refined to perfection</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.01)' }}>
            <Compass size={32} style={{ color: 'var(--primary-color)', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dynamic Discovery</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Advanced location search and highly responsive slider filters allow you to identify exactly the property matching your criteria in real-time.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.01)' }}>
            <Building size={32} style={{ color: 'var(--primary-color)', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Visit Scheduling</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Book structured physical visits at preferred dates and times directly through property detail sheets, monitored and approved by active agents.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.01)' }}>
            <ShieldCheck size={32} style={{ color: 'var(--primary-color)', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Verified Accounts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Secure bcrypt password hashing, JWT credentials, and custom administrative oversight ensure you trade in a fully verified system.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Properties List */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={24} style={{ color: 'var(--secondary-color)', fill: 'var(--secondary-color)' }} /> 
              Featured Listings
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Handpicked ultra-luxurious residential and commercial spaces currently available</p>
          </div>
          <Link to="/listings" className="outline-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Retrieving curated properties...
          </div>
        ) : featured.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No available properties found. Start by listing one!
          </div>
        ) : (
          <div className="grid-listings animate-fade-in">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
