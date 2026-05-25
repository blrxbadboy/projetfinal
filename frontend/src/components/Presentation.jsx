import React from 'react';

export default function Presentation({ onGetStarted }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '100px 20px',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e0f2fe 100%)',
      color: '#0f172a'
    }}>
      <h1 style={{ fontSize: '3.2rem', marginBottom: '20px' }}>
        Trouvez les meilleurs freelances en Tunisie
      </h1>
      <p style={{ fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.7' }}>
        La première plateforme tunisienne qui connecte freelances et clients locaux et internationaux.
      </p>
      <button 
        onClick={onGetStarted} 
        className="btn btn-primary"
        style={{ fontSize: '1.2rem', padding: '16px 50px' }}
      >
        Commencer Maintenant
      </button>
    </div>
  );
}