import React, { useState, useEffect } from 'react';
import { imageAPI } from '../../services/api'; // adjust relative path as needed
import { X, Upload } from 'lucide-react';

// Props:
//  - propertyId: ID of the property to associate images with
//  - canManageProperty (bool): if true, allow delete/upload actions
const ImageUploader = ({ propertyId, canManageProperty = false }) => {
  const [files, setFiles] = useState([]); // [{ file, preview, uploading, progress, url }]
  const [error, setError] = useState('');

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    const newFiles = selected.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      progress: 0,
      url: null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = null; // reset input
  };

  const uploadFile = async (index) => {
    const item = files[index];
    if (!item || item.uploading) return;
    setError('');
    const updated = [...files];
    updated[index] = { ...item, uploading: true };
    setFiles(updated);
    try {
      const result = await imageAPI.upload(propertyId, item.file);
      // Expect result to contain image_url (or url)
      const url = result.image_url || result.url;
      updated[index] = { ...updated[index], uploading: false, url, progress: 100 };
      setFiles(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      updated[index] = { ...updated[index], uploading: false };
      setFiles(updated);
    }
  };

  const handleUploadAll = () => {
    files.forEach((_, i) => {
      if (!files[i].url) uploadFile(i);
    });
  };

  const handleDelete = async (index) => {
    const item = files[index];
    if (item.url) {
      // call backend delete endpoint
      try {
        await imageAPI.delete(propertyId, item.url);
      } catch (e) {
        // ignore deletion errors for UI purpose
      }
    }
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
  };

  return (
    <div className="image-uploader">
      {error && <div className="alert-box alert-error" style={{ marginBottom: '0.5rem' }}>{error}</div>}
      <div className="upload-controls" style={{ marginBottom: '1rem' }}>
        <label className="gradient-btn" htmlFor="file-input" style={{ cursor: 'pointer' }}>
          <Upload size={16} style={{ marginRight: '0.4rem' }} /> Choose Photos
        </label>
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {files.length > 0 && (
          <button className="outline-btn" onClick={handleUploadAll} style={{ marginLeft: '0.5rem' }}>
            Upload All
          </button>
        )}
      </div>

      <div className="preview-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        {files.map((item, idx) => (
          <div key={idx} className="preview-item" style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={item.preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {item.uploading && (
              <div className="overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                Uploading…
              </div>
            )}
            {canManageProperty && (
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="icon-btn"
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.8)', borderRadius: '50%' }}
                title="Remove"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
