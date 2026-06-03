import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, imageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const AddEditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isAgent, isSeller } = useAuth();
  const isEditing = !!id;

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('residential');
  const [rooms, setRooms] = useState(3);
  const [availability, setAvailability] = useState('available');
  const [contactInfo, setContactInfo] = useState('');
  
  // Support three image URL text inputs
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [image3, setImage3] = useState('');
  const [image2File, setImage2File] = useState(null);
  const [image3File, setImage3File] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Access Control: Block unauthorized users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const isAllowed = isAdmin || isAgent || isSeller;
    if (!isAllowed) {
      navigate('/');
    }
  }, [isAuthenticated, user]);

  // Load existing details if editing
  useEffect(() => {
    if (isEditing) {
      loadPropertyDetails();
    }
  }, [id]);

  const loadPropertyDetails = async () => {
    setLoading(true);
    try {
      const data = await propertyAPI.getById(id);
      
      // Access check: only owner, agent, or admin can edit
      if (!isAdmin && !isAgent && data.owner_id !== user.id) {
        setError('Access denied. You do not own this listing.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setName(data.name);
      setDescription(data.description);
      setLocation(data.location);
      setPrice(data.price);
      setType(data.type);
      setRooms(data.rooms);
      setAvailability(data.availability);
      setContactInfo(data.contact_info);
      
      if (data.images) {
        if (data.images[0]) setImage1(data.images[0]);
        if (data.images[1]) setImage2(data.images[1]);
        if (data.images[2]) setImage3(data.images[2]);
      }
    } catch (err) {
      setError('Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !description || !location || !price || !contactInfo) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let finalImage2 = image2;
      let finalImage3 = image3;

if (image2File) {
  const uploaded = await imageAPI.upload(image2File);
  finalImage2 = uploaded.image_url;
}

if (image3File) {
  const uploaded = await imageAPI.upload(image3File);
  finalImage3 = uploaded.image_url;
}

const imagesArr = [image1, finalImage2, finalImage3].filter(url => url.trim() !== '');

      const propertyData = {
        name,
        description,
        location,
        price: Number(price),
        type,
        rooms: Number(rooms),
        availability,
        contact_info: contactInfo,
        images: imagesArr
      };

      if (isEditing) {
        await propertyAPI.update(id, propertyData);
        setSuccess('Listing updated successfully! Redirecting...');
        setTimeout(() => navigate(`/listings/${id}`), 1500);
      } else {
        const res = await propertyAPI.create(propertyData);
        const newId = res.id || res.insertId;
        setSuccess('Listing created successfully! Redirecting...');
        setTimeout(() => navigate(`/listings/${newId}`), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit listing details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      
      <div className="glass-panel" style={{ padding: '2.5rem', background: 'var(--bg-card)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <PlusCircle size={28} style={{ color: 'var(--primary-color)' }} />
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {isEditing ? 'Modify Property Listing' : 'Publish Property Listing'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Fill in the parameters below to configure your property showcase.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit}>
          
          {/* Title / Name */}
          <div className="form-group">
            <label>Property Name / Headline</label>
            <input 
              type="text" 
              placeholder="e.g. Sunset Luxury Penthouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          {/* Location & Contact Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Location / City</label>
              <input 
                type="text" 
                placeholder="e.g. Los Angeles, California"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Phone / Information</label>
              <input 
                type="text" 
                placeholder="e.g. +1 (555) 321-7654"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="form-control"
                required
              />
            </div>
          </div>

          {/* Price, Type, Rooms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Price Asking ($)</label>
              <input 
                type="number" 
                placeholder="Value"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Classification</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="form-control"
                style={{ background: '#1b2336' }}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="form-group">
              <label>Room Count</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                className="form-control"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FileText size={14} style={{ color: 'var(--primary-color)' }} /> Description & Details
            </label>
            <textarea 
              placeholder="Provide a comprehensive marketing description, key features, amenities, and close conveniences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              style={{ minHeight: '140px', resize: 'vertical' }}
              required
            />
          </div>

          {/* Availability Status */}
          {isEditing && (
            <div className="form-group">
              <label>Availability Status</label>
              <select 
                value={availability} 
                onChange={(e) => setAvailability(e.target.value)}
                className="form-control"
                style={{ background: '#1b2336' }}
              >
                <option value="available">Available (Active Listing)</option>
                <option value="sold">Sold Out</option>
                <option value="rented">Leased / Rented</option>
              </select>
            </div>
          )}

          {/* Property Image Gallery inputs */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Image Gallery URLs (Max 3)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Primary Cover Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/... (Cover)"
                  value={image1}
                  onChange={(e) => setImage1(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Interior Gallery Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/... (Interior)"
                  value={image2}
                  onChange={(e) => setImage2(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
                <input
  type="file"
  accept="image/jpeg,image/jpg"
  onChange={(e) => setImage2File(e.target.files[0])}
  className="form-control"
  style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}
/>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Exterior/Bathroom Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/... (Additional)"
                  value={image3}
                  onChange={(e) => setImage3(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
                <input
  type="file"
  accept="image/jpeg,image/jpg"
  onChange={(e) => setImage3File(e.target.files[0])}
  className="form-control"
  style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}
/>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => navigate(isEditing ? `/listings/${id}` : '/listings')}
              className="outline-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="gradient-btn"
              disabled={loading}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : (isEditing ? 'Save Changes' : 'Publish Listing')}
            </button>
          </div>

        </form>

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

export default AddEditProperty;
