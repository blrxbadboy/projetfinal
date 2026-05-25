import React, { useState, useEffect, useRef } from 'react';
import '../index.css';

export default function Header({
  isLoggedIn,
  onLogout,
  onOpenAuth,
  onOpenEditProfile
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const dropdownRef = useRef(null);

  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (isLoggedIn && userEmail) {
      fetch(`http://localhost:5000/api/users/${userEmail}`)
        .then(res => res.json())
        .then(data => setAvatarUrl(data.avatar || ''))
        .catch(() => setAvatarUrl(''));
    }
  }, [isLoggedIn, userEmail]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="btala-navbar">
      <div className="navbar-container">
        
        {/* Left branding */}
        <h2 className="navbar-logo">
          Btala <span className="logo-accent">TN</span>
        </h2>

        {/* Right navigation actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <div ref={dropdownRef} className="btala-dropdown-container">
              
              {/* Premium Interactive Avatar Circle */}
              <div
                className="btala-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
                title={userName}
              >
                {!avatarUrl && userName
                  ? userName.charAt(0).toUpperCase()
                  : ''}
              </div>

              {/* Modern Dropdown Menu Options */}
              {showDropdown && (
                <div className="btala-dropdown-menu">
                  <div className="dropdown-user-info">
                    <span className="info-name">{userName || "Utilisateur"}</span>
                    <span className="info-email">{userEmail}</span>
                  </div>
                  <hr className="dropdown-divider" />
                  
                  <button
                    className="btala-dropdown-btn"
                    onClick={() => {
                      onOpenEditProfile();
                      setShowDropdown(false);
                    }}
                  >
                    ⚙️ Mon Profil
                  </button>

                  <button
                    className="btala-dropdown-btn btala-logout-btn"
                    onClick={() => {
                      onLogout();
                      setShowDropdown(false);
                    }}
                  >
                    🚪 Déconnexion
                  </button>
                </div>
              )}

            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-nav-primary">
              Se Connecter
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}