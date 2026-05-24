import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal, RefreshCcw, DollarSign } from 'lucide-react';

const Listings = () => {
  const routerLocation = useLocation();

  // Helper to extract query parameters on load
  const getQueryParam = (param) => {
    const searchParams = new URLSearchParams(routerLocation.search);
    return searchParams.get(param) || '';
  };

  // Filter States
  const [location, setLocation] = useState(getQueryParam('location'));
  const [type, setType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rooms, setRooms] = useState('all');
  const [availability, setAvailability] = useState('available'); // default show available

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with router query parameter if search triggered from Homepage
  useEffect(() => {
    const queryLoc = getQueryParam('location');
    if (queryLoc) {
      setLocation(queryLoc);
    }
  }, [routerLocation.search]);

  // Fetch properties on filter change
  useEffect(() => {
    fetchFilteredProperties();
  }, [location, type, minPrice, maxPrice, rooms, availability]);

  const fetchFilteredProperties = async () => {
    setLoading(true);
    try {
      const filters = {
        location,
        type,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        rooms: rooms === 'all' ? undefined : rooms,
        availability: availability === 'all' ? undefined : availability
      };
      const data = await propertyAPI.getAll(filters);
      setProperties(data);
    } catch (err) {
      console.error('Failed to retrieve properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setLocation('');
    setType('all');
    setMinPrice('');
    setMaxPrice('');
    setRooms('all');
    setAvailability('available');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Explore <span className="glow-text">Properties</span></h2>
        <p style={{ color: 'var(--text-muted)' }}>Search and filter the finest residential and commercial spaces globally.</p>
      </div>

      {/* Main Exploration Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* 1. Left Filters Sidebar */}
        <aside className="glass-panel" style={{
          padding: '2rem',
          background: 'var(--bg-card)',
          position: 'sticky',
          top: '90px',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.1rem' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--primary-color)' }} /> Filters
            </span>
            <button 
              onClick={handleResetFilters} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
            >
              <RefreshCcw size={12} /> Reset
            </button>
          </div>

          {/* Search bar */}
          <div className="form-group">
            <label>Location or City</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          {/* Property classification */}
          <div className="form-group">
            <label>Property Classification</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="form-control"
              style={{ background: '#1b2336' }}
            >
              <option value="all">All Classifications</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          {/* Rooms count */}
          <div className="form-group">
            <label>Number of Rooms</label>
            <select 
              value={rooms} 
              onChange={(e) => setRooms(e.target.value)}
              className="form-control"
              style={{ background: '#1b2336' }}
            >
              <option value="all">Any Room Count</option>
              <option value="1">1 Room</option>
              <option value="2">2 Rooms</option>
              <option value="3">3 Rooms</option>
              <option value="4">4 Rooms</option>
              <option value="5">5+ Rooms</option>
              <option value="8">8+ Rooms (Corporate)</option>
            </select>
          </div>

          {/* Price Range Bounds */}
          <div className="form-group">
            <label>Price Range ($)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-control"
                style={{ padding: '0.5rem 0.75rem' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-control"
                style={{ padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Status & Availability</label>
            <select 
              value={availability} 
              onChange={(e) => setAvailability(e.target.value)}
              className="form-control"
              style={{ background: '#1b2336' }}
            >
              <option value="all">All States</option>
              <option value="available">Available (Active Listings)</option>
              <option value="sold">Sold Out</option>
              <option value="rented">Leased / Rented</option>
            </select>
          </div>

        </aside>

        {/* 2. Right Listings Grid */}
        <main style={{ gridColumn: 'span 2' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
              Filtering properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
              <h3>No Properties Match Your Search</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Try clearing filters or checking other locations.</p>
              <button onClick={handleResetFilters} className="outline-btn" style={{ marginTop: '1.5rem', padding: '0.5rem 1.25rem' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid-listings animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  );
};

export default Listings;
