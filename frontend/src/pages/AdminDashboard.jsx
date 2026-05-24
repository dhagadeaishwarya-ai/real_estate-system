import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI, propertyAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Building, Calendar, Shield, Award, Edit, Trash2, Check, X, ShieldAlert, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs: 'stats' | 'users' | 'properties' | 'bookings'
  const [activeTab, setActiveTab] = useState('users');
  
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Access check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
    } else {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load all records in parallel
      const [statsData, usersData, propsData, bookingsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        propertyAPI.getAll({ availability: 'all' }),
        bookingAPI.getAll()
      ]);

      setStats(statsData);
      setUsersList(usersData);
      setPropertiesList(propsData);
      setBookingsList(bookingsData);
    } catch (err) {
      setError('Failed to sync master admin databases.');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setActionLoading(`user-role-${userId}`);
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsersList(prev => 
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
      // Reload stats in background
      const statsData = await adminAPI.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? All listings and bookings created by this user will be deleted!')) {
      return;
    }
    setError('');
    setActionLoading(`user-del-${userId}`);
    try {
      await adminAPI.deleteUser(userId);
      setUsersList(prev => prev.filter(u => u.id !== userId));
      // Cascade delete locally for listings and bookings owned by that user
      setPropertiesList(prev => prev.filter(p => p.owner_id !== userId));
      // Reload listings & bookings
      const [statsData, bookingsData] = await Promise.all([
        adminAPI.getStats(),
        bookingAPI.getAll()
      ]);
      setStats(statsData);
      setBookingsList(bookingsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  // Property Actions
  const handlePropertyDelete = async (propertyId) => {
    if (!window.confirm('Delete this property listing permanently?')) {
      return;
    }
    setError('');
    setActionLoading(`prop-del-${propertyId}`);
    try {
      await propertyAPI.delete(propertyId);
      setPropertiesList(prev => prev.filter(p => p.id !== propertyId));
      // Reload stats and bookings in background
      const [statsData, bookingsData] = await Promise.all([
        adminAPI.getStats(),
        bookingAPI.getAll()
      ]);
      setStats(statsData);
      setBookingsList(bookingsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(null);
    }
  };

  // Booking Actions
  const handleBookingStatus = async (bookingId, status) => {
    setError('');
    setActionLoading(`book-status-${bookingId}`);
    try {
      await bookingAPI.updateStatus(bookingId, status);
      setBookingsList(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status } : b)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (p) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>Retrieving system metrics directory...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LayoutDashboard size={28} style={{ color: 'var(--primary-color)' }} />
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            Admin <span className="glow-text">Dashboard</span>
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage users directory, property catalogs, and system-wide tour bookings.</p>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Summary Cards Row */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Card 1: Users */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="flex-center" style={{ width: '45px', height: '45px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', color: 'var(--primary-color)' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Users</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalUsers}</div>
            </div>
          </div>

          {/* Card 2: Properties */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="flex-center" style={{ width: '45px', height: '45px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '8px', color: 'var(--secondary-color)' }}>
              <Building size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Listings</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalProperties}</div>
            </div>
          </div>

          {/* Card 3: Bookings */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="flex-center" style={{ width: '45px', height: '45px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: 'var(--success)' }}>
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Bookings</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalBookings}</div>
            </div>
          </div>

          {/* Card 4: Available properties count */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="flex-center" style={{ width: '45px', height: '45px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: 'var(--warning)' }}>
              <Building size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Spots</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.availableProperties}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Management tabs triggers */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        <button 
          onClick={() => setActiveTab('users')}
          className="outline-btn"
          style={{
            background: activeTab === 'users' ? 'rgba(99,102,241,0.1)' : 'transparent',
            borderColor: activeTab === 'users' ? 'var(--primary-color)' : 'var(--border-color)',
            padding: '0.5rem 1.25rem',
            fontSize: '0.9rem'
          }}
        >
          Users Registry
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className="outline-btn"
          style={{
            background: activeTab === 'properties' ? 'rgba(99,102,241,0.1)' : 'transparent',
            borderColor: activeTab === 'properties' ? 'var(--primary-color)' : 'var(--border-color)',
            padding: '0.5rem 1.25rem',
            fontSize: '0.9rem'
          }}
        >
          Properties Registry
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className="outline-btn"
          style={{
            background: activeTab === 'bookings' ? 'rgba(99,102,241,0.1)' : 'transparent',
            borderColor: activeTab === 'bookings' ? 'var(--primary-color)' : 'var(--border-color)',
            padding: '0.5rem 1.25rem',
            fontSize: '0.9rem'
          }}
        >
          Bookings Master
        </button>
      </div>

      {/* 3. Tab contents block */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)', overflowX: 'auto' }}>
        
        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>User Profiles Registry</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th style={{ textAlign: 'center' }}>Modify Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.id}>
                    <td>{usr.id}</td>
                    <td style={{ fontWeight: 600 }}>{usr.name}</td>
                    <td>{usr.email}</td>
                    <td>
                      <span className={`badge ${
                        usr.role === 'admin' ? 'badge-error' :
                        usr.role === 'agent' ? 'badge-success' :
                        usr.role === 'seller' ? 'badge-warning' : 'badge-info'
                      }`} style={{ fontSize: '0.75rem' }}>
                        {usr.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select 
                        value={usr.role}
                        onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                        className="form-control"
                        style={{ display: 'inline-block', width: '120px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#0b0f19' }}
                        disabled={actionLoading === `user-role-${usr.id}` || usr.id === user.id}
                      >
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="agent">agent</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleUserDelete(usr.id)}
                        className="outline-btn"
                        style={{ padding: '0.35rem 0.6rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                        disabled={actionLoading === `user-del-${usr.id}` || usr.id === user.id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PROPERTIES CATALOG */}
        {activeTab === 'properties' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>System Property Catalog</h3>
              <Link to="/add-property" className="gradient-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Create New Property
              </Link>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Headline</th>
                  <th>Location</th>
                  <th>Asking Value</th>
                  <th>Classification</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertiesList.map((prop) => (
                  <tr key={prop.id}>
                    <td>{prop.id}</td>
                    <td style={{ fontWeight: 600 }}>{prop.name}</td>
                    <td>{prop.location}</td>
                    <td>{formatPrice(prop.price)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{prop.type}</td>
                    <td>
                      <span className={`badge ${
                        prop.availability === 'available' ? 'badge-success' : 'badge-error'
                      }`}>
                        {prop.availability}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link 
                          to={`/edit-property/${prop.id}`} 
                          className="outline-btn"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Edit size={14} />
                        </Link>
                        <button 
                          onClick={() => handlePropertyDelete(prop.id)}
                          className="outline-btn"
                          style={{ padding: '0.35rem 0.6rem', borderColor: 'var(--error)', color: 'var(--error)' }}
                          disabled={actionLoading === `prop-del-${prop.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: BOOKINGS MASTER */}
        {activeTab === 'bookings' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Tour Bookings Registry</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Property</th>
                  <th>Client</th>
                  <th>Host</th>
                  <th>Scheduled Slot</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Direct Control</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map((bk) => (
                  <tr key={bk.id}>
                    <td>{bk.id}</td>
                    <td style={{ fontWeight: 600 }}>{bk.property_name}</td>
                    <td>{bk.buyer_name} ({bk.buyer_email})</td>
                    <td>{bk.host_name}</td>
                    <td>{bk.preferred_date} @ {bk.preferred_time}</td>
                    <td>
                      <span className={`badge ${
                        bk.status === 'approved' ? 'badge-success' :
                        bk.status === 'rejected' ? 'badge-error' : 'badge-warning'
                      }`}>
                        {bk.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {bk.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleBookingStatus(bk.id, 'approved')}
                            className="outline-btn"
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)' }}
                            disabled={actionLoading === `book-status-${bk.id}`}
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleBookingStatus(bk.id, 'rejected')}
                            className="outline-btn"
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--error)', borderColor: 'rgba(244,63,94,0.3)' }}
                            disabled={actionLoading === `book-status-${bk.id}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
