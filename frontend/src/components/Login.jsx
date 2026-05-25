import React, { useState } from 'react';
import '../index.css';

export default function Login({ onLoginSuccess, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isSignUp ? 'signup' : 'login';
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name || 'Utilisateur');
        localStorage.setItem('userEmail', email);
        onLoginSuccess();
      } else {
        setError(data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Impossible de joindre le serveur.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="btala-login-card">
        <button onClick={onClose} className="login-close-btn">
          &times;
        </button>

        <h2>{isSignUp ? "Créer un compte" : "Connexion"}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="login-field-group">
              <label>Nom complet</label>
              <input 
                type="text" 
                placeholder="Ex: Rayen B" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          
          <div className="login-field-group">
            <label>Adresse Email</label>
            <input 
              type="email" 
              placeholder="nom@exemple.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="login-field-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <p className="login-error-msg">{error}</p>}

          <button type="submit" className="login-submit-btn">
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>

        <p className="login-footer">
          {isSignUp ? "Déjà un compte ?" : "Nouveau sur la plateforme ?"} 
          <span 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
            className="signup-link"
          >
            {isSignUp ? " Se connecter" : " Créer un compte"}
          </span>
        </p>
      </div>
    </div>
  );
}