import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle, RefreshCw, FileText } from 'lucide-react';

const VisitBooking = () => {
  const { user, isAuthenticated, isAdmin, isAgent, isSeller } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const isHost = isAdmin || isAgent || isSeller;

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingAPI.getAll();
      setBookings(data);
    } catch (err) {
      setError('Failed to retrieve your scheduled bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setError('');
    setActionLoading(bookingId);
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      // Update local state smoothly
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeStr) => {
    // Standard time string (HH:MM:SS) format to readable HH:MM AM/PM
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>Retrieving scheduled visits...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
          Visit <span className="glow-text">Bookings Schedule</span>
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {isHost 
            ? 'Monitor and manage visitor schedules, authorize tours, and check client contacts.'
            : 'Track the status of scheduled physical property tours and host contact cards.'
          }
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Display Container */}
      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ color: 'var(--primary-color)', marginBottom: '1.25rem' }} />
          <h3>No Visited Slots Booked</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {isHost 
              ? 'Clients have not scheduled any visits to your active listings yet.' 
              : 'You have not requested any property tours yet. Navigate to any listing details page to schedule.'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="glass-panel" 
              style={{
                padding: '2rem',
                background: 'var(--bg-card)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center',
                borderLeft: booking.status === 'approved' ? '4px solid var(--success)' : 
                            booking.status === 'rejected' ? '4px solid var(--error)' : '4px solid var(--warning)'
              }}
            >
              
              {/* 1. Property Details Brief */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Property
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>{booking.property_name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <MapPin size={12} /> <span>{booking.property_location}</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {formatPrice(booking.property_price)}
                </div>
              </div>

              {/* 2. Schedule Date/Time */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Scheduled Slot
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{formatDate(booking.preferred_date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{formatTime(booking.preferred_time)}</span>
                </div>
              </div>

              {/* 3. Client / Host details */}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  {isHost ? 'Visitor Contact' : 'Host Contact'}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  {isHost ? booking.buyer_name : booking.host_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {isHost ? booking.buyer_email : booking.host_contact}
                </div>
              </div>

              {/* 4. Action / Status triggers */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '0.75rem' }}>
                
                {/* Status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                  <span className={`badge ${
                    booking.status === 'approved' ? 'badge-success' :
                    booking.status === 'rejected' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* Accept/Reject triggers for host */}
                {isHost && booking.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '200px' }}>
                    <button 
                      onClick={() => handleStatusChange(booking.id, 'approved')}
                      className="gradient-btn"
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        flexGrow: 1,
                        justifyContent: 'center',
                        background: 'var(--success)',
                        boxShadow: 'none'
                      }}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? <RefreshCw className="animate-spin" size={12} /> : <Check size={14} />} Approve
                    </button>
                    <button 
                      onClick={() => handleStatusChange(booking.id, 'rejected')}
                      className="outline-btn"
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        flexGrow: 1,
                        justifyContent: 'center',
                        borderColor: 'var(--error)',
                        color: 'var(--error)'
                      }}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? <RefreshCw className="animate-spin" size={12} /> : <X size={14} />} Reject
                    </button>
                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

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

export default VisitBooking;
