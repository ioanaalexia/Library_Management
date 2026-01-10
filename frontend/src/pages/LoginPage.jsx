import React, { useState } from 'react';
import { useMutation, gql } from "@apollo/client";
import { useNavigate } from 'react-router-dom';
import { LOGIN_MUTATION } from '../graphql/mutations';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.login);
      alert('Autentificare reușită!');
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error(err);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      login({ variables: { username, password } });
    } else {
      alert('Te rugăm să completezi toate câmpurile.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <h2>Biblioteca - Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Utilizator (ex: admin)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Se verifică...' : 'Intră în cont'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red' }}>Eroare: {error.message}</p>}
    </div>
  );
};

export default LoginPage;