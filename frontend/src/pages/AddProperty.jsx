import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader/ImageUploader';
import { Send, Plus } from 'lucide-react';

const AddProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'upload'
  const [propertyId, setPropertyId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    price: '',
    type: 'residential',
    rooms: 1,
    contact_info: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await propertyAPI.create(formData);
      const newId = result.id || result.insertId; // backend returns created property id
      setPropertyId(newId);
      setSuccess('Property created successfully!');
      setStep('upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    // After uploading images, redirect to the property detail page
    navigate(`/properties/${propertyId}`);
  };

  return (
    <section className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)' }}>
      {step === 'form' && (
        <>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <Plus size={20} style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} /> Add New Property
          </h2>
          {error && (
            <div className="alert-box alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="alert-box alert-success" style={{ marginBottom: '1rem' }}>
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <input name="name" placeholder="Property Name" value={formData.name} onChange={handleChange} required className="form-control" />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="form-control" rows="3" />
            <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required className="form-control" />
            <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required className="form-control" />
            <select name="type" value={formData.type} onChange={handleChange} className="form-control">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
            <input name="rooms" type="number" placeholder="Number of Rooms" value={formData.rooms} onChange={handleChange} min="1" className="form-control" />
            <input name="contact_info" placeholder="Contact Info" value={formData.contact_info} onChange={handleChange} required className="form-control" />
            <button type="submit" className="gradient-btn" disabled={loading} style={{ marginTop: '1rem' }}>
              <Send size={14} style={{ marginRight: '0.4rem' }} />
              {loading ? 'Creating...' : 'Create Property'}
            </button>
          </form>
        </>
      )}

      {step === 'upload' && propertyId && (
        <>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Upload Photos for Property #{propertyId}</h3>
          <ImageUploader propertyId={propertyId} canManageProperty={true} />
          <button className="outline-btn" onClick={handleDone} style={{ marginTop: '1rem' }}>
            Done – View Property
          </button>
        </>
      )}
    </section>
  );
};

export default AddProperty;
