import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoanCalculator from '../components/LoanCalculator';
import { Calendar, User, Phone, Mail, CheckCircle, AlertCircle, Building, MapPin, Bed, Layers, CreditCard, ChevronRight, Edit2, Trash2 } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer, isAdmin, isAgent, isSeller } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const data = await propertyAPI.getById(id);
      setProperty(data);
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0]);
      }
    } catch (err) {
      console.error('Failed to load property details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await propertyAPI.delete(id);
      navigate('/listings');
    } catch (err) {
      setShowDeleteConfirm(false);
      setDeleteLoading(false);
      alert(err.response?.data?.message || 'Failed to delete property.');
    }
  };

  // Check if the logged-in user can manage this property
  // Use Number() to avoid strict type mismatch between DB integer and JS value
  const canManageProperty = isAuthenticated &&
    (isAdmin || ((isAgent || isSeller) && Number(property?.owner_id) === Number(user?.id)));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!bookingDate || !bookingTime) {
      setBookingError('Please select both a preferred date and time.');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        property_id: id,
        preferred_date: bookingDate,
        preferred_time: bookingTime
      };
      await bookingAPI.create(bookingData);
      setBookingSuccess('Your visit has been booked successfully! You can track its status in the bookings tab.');
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book visit.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>Retrieving listing specifications...</div>;
  }

  if (!property) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
        <h2>Listing Not Found</h2>
        <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>The property you are looking for does not exist or has been removed.</p>
        <Link to="/listings" className="gradient-btn">Back to Listings</Link>
      </div>
    );
  }

  const { name, description, location, price, type, rooms, availability, contact_info, owner_name, owner_email, owner_role } = property;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);

  // Set minimum date to today so users cannot pick past dates
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <ChevronRight size={12} />
        <Link to="/listings" style={{ color: 'var(--text-muted)' }}>Explore</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{name}</span>
      </div>

      {/* Main Specifications Title Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>{name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
            <MapPin size={16} style={{ color: 'var(--primary-color)' }} />
            <span>{location}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Asking Value</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-display)' }}>{formattedPrice}</div>
          </div>
          {/* Edit & Delete buttons — visible only to the property owner, agent, or admin */}
          {canManageProperty && (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link
                to={`/edit-property/${id}`}
                className="outline-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.5rem 1.1rem' }}
              >
                <Edit2 size={15} /> Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="outline-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.875rem', padding: '0.5rem 1.1rem',
                  borderColor: 'var(--error)', color: 'var(--error)'
                }}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Delete Confirmation Panel */}
      {showDeleteConfirm && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
          background: 'rgba(244, 63, 94, 0.05)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--error)' }}>Confirm Permanent Deletion</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                This will permanently remove <strong style={{ color: 'var(--text-main)' }}>{name}</strong> and all its images and bookings. This cannot be undone.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="outline-btn"
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="outline-btn"
              style={{
                padding: '0.5rem 1.25rem', fontSize: '0.875rem',
                background: 'var(--error)', color: 'white',
                borderColor: 'var(--error)', fontWeight: 700
              }}
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Property'}
            </button>
          </div>
        </div>
      )}

      {/* Grid Layout: Left Gallery & Specs / Right Booking form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start', marginBottom: '4rem' }}>
        
        {/* LEFT COLUMN: Gallery, Description, Spec Grids */}
        <div style={{ gridColumn: 'span 2' }}>
          
          {/* 1. Property Interactive Image Gallery */}
          <div className="glass-panel" style={{ padding: '0.75rem', overflow: 'hidden', marginBottom: '2.5rem' }}>
            {/* Primary Large Image */}
            <div style={{ width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem', background: '#121824' }}>
              <img 
                src={activeImage} 
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
              />
            </div>
            
            {/* Gallery Thumbnails List */}
            {property.images && property.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {property.images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImage(img)}
                    style={{
                      border: activeImage === img ? '2px solid var(--primary-color)' : '2px solid transparent',
                      padding: 0,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      width: '90px',
                      height: '60px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: 'none'
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Specs Description Card */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Property Overview
            </h3>
            
            {/* Key Specs tags */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <Bed size={20} style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room Count</div>
                <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>{rooms} Rooms</div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <Layers size={20} style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classification</div>
                <div style={{ fontWeight: 700, marginTop: '0.1rem', textTransform: 'capitalize' }}>{type}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <Building size={20} style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Availability</div>
                <span className={`badge ${
                  availability === 'available' ? 'badge-success' : 'badge-error'
                }`} style={{ display: 'inline-block', padding: '0.05rem 0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {availability}
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{description}</p>
          </div>

        </div>

        {/* RIGHT COLUMN: Contact Host & Booking Module */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 1. Host Contact Info Card */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Listed By</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="flex-center" style={{
                width: '45px',
                height: '45px',
                background: 'var(--accent-gradient)',
                borderRadius: '50%',
                color: 'white',
                fontWeight: 700
              }}>
                {owner_name ? owner_name[0] : <User size={20} />}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{owner_name}</div>
                <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0rem 0.35rem', textTransform: 'uppercase' }}>
                  {owner_role}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: 'var(--primary-color)' }} />
                <span>{contact_info}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: 'var(--primary-color)' }} />
                <span style={{ wordBreak: 'break-all' }}>{owner_email}</span>
              </div>
            </div>
          </div>

          {/* 2. Schedule Visit Booking Box */}
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary-color)' }} /> Schedule Visit
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Book an in-person tour of this property with the designated host.
            </p>

            {bookingSuccess && (
              <div className="alert-box alert-success" style={{ padding: '0.75rem' }}>
                <CheckCircle size={16} />
                <span style={{ fontSize: '0.8rem' }}>{bookingSuccess}</span>
              </div>
            )}

            {bookingError && (
              <div className="alert-box alert-error" style={{ padding: '0.75rem' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.8rem' }}>{bookingError}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Please log in as a Buyer to book a property visit.
                </p>
                <Link to="/login" className="outline-btn" style={{ fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>
                  Sign In
                </Link>
              </div>
            ) : !isBuyer ? (
              <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', color: 'var(--warning)', fontSize: '0.85rem', textAlign: 'center' }}>
                Only Buyer accounts can book physical visit scheduling appointments. Your active role is <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</span>.
              </div>
            ) : availability !== 'available' ? (
              <div style={{ padding: '0.75rem', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>
                This property has been marked as <span style={{ fontWeight: 700 }}>{availability}</span> and is closed to tours.
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Preferred Date</label>
                  <input 
                    type="date" 
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Preferred Time</label>
                  <input 
                    type="time" 
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="gradient-btn" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                  disabled={bookingLoading}
                >
                  Confirm Request
                </button>
              </form>
            )}
          </div>

        </aside>

      </div>

      {/* 3. Mortgage Calculator quick embedded section */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={22} style={{ color: 'var(--secondary-color)' }} /> Local Mortgage Forecast
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Visualize mortgage distributions and calculate customized EMI schedules directly for this property.</p>
        </div>
        <LoanCalculator defaultAmount={price} />
      </section>

    </div>
  );
};

export default PropertyDetails;
