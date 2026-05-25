import React, { useState, useEffect } from 'react';
import '../index.css';

export default function ProfileView({ mode, targetEmail, onClose, onSaveSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [cover, setCover] = useState('');
  const [cin, setCin] = useState('');
  const [cvName, setCvName] = useState('');
  const [experience, setExperience] = useState('0');

  const token = localStorage.getItem('token');
  const emailToFetch = mode === 'edit' ? localStorage.getItem('userEmail') : targetEmail;

  useEffect(() => {
    if (!emailToFetch) return;

    fetch(`http://localhost:5000/api/users/${emailToFetch}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name || '');
        setAvatar(data.avatar || '');
        setCover(data.cover || '');
        setCin(data.cin || '');
        setCvName(data.cvName || '');
        setExperience(data.experience || '0');
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger le profil");
        setLoading(false);
      });
  }, [emailToFetch]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatar, cover, cin, cvName, experience })
      });

      if (response.ok) {
        alert("✅ Profil mis à jour avec succès !");
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      } else {
        setError("Erreur lors de la sauvegarde");
      }
    } catch (err) {
      setError("Erreur réseau");
    }
  };

  if (loading) return <div className="modal-overlay">Chargement...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content btala-profile-card">
        <button onClick={onClose} style={{ float: 'right', fontSize: '30px', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>

        {/* Cover Image Banner */}
        <div style={{ height: '160px', background: cover ? `url(${cover}) center/cover` : '#3b82f6', borderRadius: '12px 12px 0 0', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            bottom: '-45px',
            left: '30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '5px solid white',
            background: avatar ? `url(${avatar}) center/cover` : '#94a3b8'
          }} />
        </div>

        <div className="btala-form-container">
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {mode === 'view' ? (
            <div>
              <h2>{name}</h2>
              <p style={{ color: '#64748b' }}>Membre Btala TN</p>
              <p>⏱️ {experience} ans d'expérience</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="btala-edit-form">
              <h3>Modifier mon profil</h3>

              <div className="btala-field-group">
                <label>Nom complet</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="btala-field-group">
                <label>Photo de profil</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files[0]) setAvatar(await convertToBase64(e.target.files[0]));
                }} />
              </div>

              <div className="btala-field-group">
                <label>Image de couverture</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files[0]) setCover(await convertToBase64(e.target.files[0]));
                }} />
              </div>

              <div className="btala-field-group">
                <label>CIN</label>
                <input type="text" value={cin} onChange={(e) => setCin(e.target.value)} />
              </div>

              <div className="btala-field-group">
                <label>Années d'expérience</label>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)} 
                />
                <span className="btala-range-txt">{experience} ans</span>
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
                💾 Sauvegarder
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}