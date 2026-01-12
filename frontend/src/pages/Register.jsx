import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { BookOpen, Lock, User, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!, $email: String!) {
    register(username: $username, password: $password, email: $email)
  }
`;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    // phone: '',
    // address: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER',
  });
  
  const [error, setError] = useState(null);
  const [register, { loading }] = useMutation(REGISTER_MUTATION); // Initialize the mutation

  const navigate = useNavigate(); // Hook pentru navigare

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Te rugam să completezi toate campurile obligatorii.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Parola trebuie sa aiba cel putin 6 caractere.');
      return;
    }

    try {
        await register({
          variables: {
            username: formData.username,
            password: formData.password,
            email: formData.email,
          },
        });
        alert('Cont creat cu succes!');
        navigate('/login');
      } catch (err) {
        setError(err.message);
      }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.decorativeContainer}>
        <div style={{...styles.floatingBlob, ...styles.blob1}}></div>
        <div style={{...styles.floatingBlob, ...styles.blob2}}></div>
        <div style={{...styles.floatingBlob, ...styles.blob3}}></div>
      </div>

      <div style={styles.cardWrapper}>
        <div style={styles.cardGlow}></div>
        
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <BookOpen size={40} color="white" />
            </div>
            <h1 style={styles.title}>Creeaza cont</h1>
            <p style={styles.subtitle}>Alatura-te bibliotecii noastre</p>
          </div>

          <div style={styles.formContainer}>
            <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <User size={20} color="#d8b4fe" />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Nume utilizator *"
                value={formData.username}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={styles.input}
                onFocus={(e) => e.target.style.outline = '2px solid #a855f7'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <Mail size={20} color="#d8b4fe" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={styles.input}
                onFocus={(e) => e.target.style.outline = '2px solid #a855f7'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
            </div>

            {/* <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <Phone size={20} color="#d8b4fe" />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Telefon (opțional)"
                value={formData.phone}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={styles.input}
                onFocus={(e) => e.target.style.outline = '2px solid #a855f7'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
            </div> */}

            {/* <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <MapPin size={20} color="#d8b4fe" />
              </div>
              <input
                type="text"
                name="address"
                placeholder="Adresă (opțional)"
                value={formData.address}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={styles.input}
                onFocus={(e) => e.target.style.outline = '2px solid #a855f7'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
            </div> */}

            <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <User size={20} color="#d8b4fe" />
              </div>
              
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <Lock size={20} color="#d8b4fe" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Parolă *"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={styles.input}
                onFocus={(e) => e.target.style.outline = '2px solid #a855f7'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.iconContainer}>
                <Lock size={20} color="#d8b4fe" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmă parola *"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                style={styles.input}
                onFocus={(e) => e.target.style.outline = '2px solid #a855f7'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
            </div>

            {error && (
              <div style={styles.errorContainer}>
                <AlertCircle size={20} color="#fca5a5" />
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(to right, #7c3aed, #db2777)';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(to right, #9333ea, #ec4899)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {loading ? (
                <span style={styles.buttonContent}>
                  <svg style={styles.spinner} viewBox="0 0 24 24">
                    <circle
                      style={styles.spinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      style={styles.spinnerPath}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Se creeaza contul...
                </span>
              ) : (
                'Creează cont'
              )}
            </button>
          </div>

          <div style={styles.linkContainer}>
            <p style={styles.linkText}>
              Ai deja cont?{' '}
              <a 
                href="/login" 
                style={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/login';
                }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#e9d5ff'}
              >
                Autentifica-te
              </a>
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom right, #312e81, #581c87, #9f1239)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  floatingBlob: {
    position: 'absolute',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    filter: 'blur(60px)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  blob1: {
    top: '80px',
    left: '40px',
    width: '288px',
    height: '288px',
    background: '#a855f7',
    animationDelay: '0s',
  },
  blob2: {
    top: '160px',
    right: '40px',
    width: '288px',
    height: '288px',
    background: '#ec4899',
    animationDelay: '1s',
  },
  blob3: {
    bottom: '80px',
    left: '50%',
    width: '288px',
    height: '288px',
    background: '#6366f1',
    animationDelay: '2s',
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    zIndex: 10,
  },
  cardGlow: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    borderRadius: '24px',
    filter: 'blur(40px)',
    opacity: 0.3,
    animation: 'pulse 2s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '32px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(to bottom right, #a855f7, #ec4899)',
    borderRadius: '16px',
    marginBottom: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#e9d5ff',
    margin: 0,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: '50%',
    left: '16px',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    paddingLeft: '48px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    paddingLeft: '48px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '20px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: '14px',
    margin: 0,
  },
  button: {
    width: '100%',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    color: 'white',
    fontWeight: '600',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    color: 'white',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    opacity: 0.25,
  },
  spinnerPath: {
    opacity: 0.75,
  },
  linkContainer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  linkText: {
    fontSize: '14px',
    color: '#e9d5ff',
    margin: 0,
  },
  link: {
    color: '#e9d5ff',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease',
  },
  footer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#d8b4fe',
    margin: 0,
  },
};

export default RegisterPage;