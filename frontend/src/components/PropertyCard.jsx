import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Layers, ArrowUpRight } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const { id, name, location, price, type, rooms, availability, primary_image } = property;

  // Format price beautifully in local currency format
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);

  const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Property Image with overlay badges */}
      <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={primary_image || fallbackImage} 
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {/* Availability Badge */}
        <span className={`badge ${
          availability === 'available' ? 'badge-success' :
          availability === 'sold' ? 'badge-error' : 'badge-warning'
        }`} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backdropFilter: 'blur(8px)',
          fontWeight: 700
        }}>
          {availability}
        </span>

        {/* Type Badge */}
        <span className="badge badge-info" style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          backdropFilter: 'blur(8px)',
          fontWeight: 700
        }}>
          {type === 'residential' ? 'Residential' : 'Commercial'}
        </span>
      </div>

      {/* Property Card Body */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: '1.3', color: 'var(--text-main)' }}>{name}</h3>
        </div>

        {/* Location Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <MapPin size={14} style={{ color: 'var(--primary-color)' }} />
          <span>{location}</span>
        </div>

        {/* Property Features (Rooms / Type) */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.75rem 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bed size={16} style={{ color: 'var(--secondary-color)' }} />
            <span>{rooms} {rooms === 1 ? 'Room' : 'Rooms'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={16} style={{ color: 'var(--secondary-color)' }} />
            <span style={{ textTransform: 'capitalize' }}>{type}</span>
          </div>
        </div>

        {/* Pricing & Call-to-action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              {formattedPrice}
            </div>
          </div>
          <Link to={`/listings/${id}`} className="gradient-btn" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', gap: '0.25rem' }}>
            Explore <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default PropertyCard;
