import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Presentation from './components/Presentation';
import Login from './components/Login';
import JobList from './components/JobList';
import ProfileView from './components/ProfileView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      <Header 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout} 
        onOpenAuth={() => setShowAuthModal(true)} 
        onOpenEditProfile={() => setProfileModalMode('edit')}
      />

      {!isLoggedIn ? (
        <Presentation onGetStarted={() => setShowAuthModal(true)} />
      ) : (
        <JobList key={refreshTrigger} />
      )}

      {showAuthModal && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {profileModalMode && (
        <ProfileView 
          mode={profileModalMode} 
          targetEmail={localStorage.getItem('userEmail')} 
          onClose={() => setProfileModalMode(null)}
          onSaveSuccess={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
}

export default App;