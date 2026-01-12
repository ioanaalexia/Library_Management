import React, { useContext } from 'react';
import { User, Book, Calendar, Clock, LogOut, Mail, Phone, MapPin, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_USER_DATA = gql`
  query GetUserData($username: String!) {
    user(username: $username) {
      name
      email
      phone
      address
      memberSince
      totalBorrowedBooks
      currentlyBorrowed
      activeLoans {
        id
        book {
          title
        }
      }
    }
  }
`;

const ProfilePage = () => {
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || '';
  if (!username) {
    return <p>Nu ești logat!</p>;
  }
  const { data, loading, error } = useQuery(GET_USER_DATA, {
    variables: { username },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const userData = data.user;

  const handleLogout = () => {
    localStorage.removeItem('username'); // Remove the username from local storage
    localStorage.removeItem('userId'); // Remove the userId from local storage
    navigate('/login'); // Redirect to the login page
  };

  const handleNavigateToProfile = () => {
    navigate('/profile'); // Navigate to the profile page
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusInfo = (loan) => {
    const daysRemaining = getDaysRemaining(loan.dueDate);
    
    if (daysRemaining < 0) {
      return {
        text: `Întârziere: ${Math.abs(daysRemaining)} zile`,
        color: '#ef4444',
        icon: <AlertCircle size={16} />,
      };
    } else if (daysRemaining <= 3) {
      return {
        text: `${daysRemaining} zile rămase`,
        color: '#f59e0b',
        icon: <Clock size={16} />,
      };
    } else {
      return {
        text: `${daysRemaining} zile rămase`,
        color: '#10b981',
        icon: <CheckCircle size={16} />,
      };
    }
  };

  const activeLoans = data.user.activeLoans || []; // Obține împrumuturile active din datele utilizatorului

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.avatarContainer}>
              <User size={40} color="white" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Profilul Meu</h1>
              <p style={styles.headerSubtitle}>Bine ai revenit, {userData.name.split(' ')[0]}!</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <LogOut size={20} />
            Deconectare
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.statsGrid}>

          <div style={styles.statCard}>
            <Book size={32} color="#776248ff" style={styles.statIcon} />
            <div>
              <p style={styles.statValue}>{activeLoans.length}</p>
              <p style={styles.statLabel}>Cărți împrumutate</p>
            </div>
          </div>

          {/* <div style={styles.statCard}>
            <Calendar size={32} color="#776248ff" style={styles.statIcon} />
            <div>
              <p style={styles.statValue}>{userData.memberSince}</p>
              <p style={styles.statLabel}>Membru din</p>
            </div>
          </div> */}
        </div>

        <div style={styles.contentGrid}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Informatii Personale</h2>
            <div style={styles.card}>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <User size={20} color="#9333ea" />
                </div>
                <div style={styles.infoContent}>
                  <p style={styles.infoLabel}>Nume complet</p>
                  <p style={styles.infoValue}>{userData.name}</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <Mail size={20} color="#ec4899" />
                </div>
                <div style={styles.infoContent}>
                  <p style={styles.infoLabel}>Email</p>
                  <p style={styles.infoValue}>{userData.email}</p>
                </div>
              </div>

              {/* <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <Phone size={20} color="#6366f1" />
                </div>
                <div style={styles.infoContent}>
                  <p style={styles.infoLabel}>Telefon</p>
                  <p style={styles.infoValue}>{userData.phone}</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <MapPin size={20} color="#10b981" />
                </div>
                <div style={styles.infoContent}>
                  <p style={styles.infoLabel}>Adresa</p>
                  <p style={styles.infoValue}>{userData.address}</p>
                </div>
              </div> */}
              
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Imprumuturi Active</h2>
            <div style={styles.loansContainer}>
  {activeLoans.length === 0 && <p>Nu ai împrumuturi active.</p>}
  
  {activeLoans.map((loan) => {
    const statusInfo = getStatusInfo(loan);
    return (
      <div 
        key={loan.id} 
        style={styles.loanCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        <div style={styles.loanHeader}>
          <div style={{ ...styles.bookCover, background: loan.book.coverColor || '#776248' }}>
            <Book size={24} color="white" />
          </div>
          <div style={styles.loanInfo}>
            <h3 style={styles.bookTitle}>{loan.book.title}</h3>
            <p style={styles.bookAuthor}>{loan.book.author}</p>
          </div>
        </div>

        <div style={styles.loanDetails}>
          <div style={styles.dateInfo}>
            <Calendar size={16} color="#6b7280" />
            <span style={styles.dateText}>
              Împrumutat: {new Date(loan.borrowedAt).toLocaleDateString('ro-RO')}
            </span>
          </div>
          <div style={styles.dateInfo}>
            <Clock size={16} color="#6b7280" />
            <span style={styles.dateText}>
              Returnare: {new Date(loan.dueDate).toLocaleDateString('ro-RO')}
            </span>
          </div>
        </div>

        <div style={{ ...styles.statusBadge, background: `${statusInfo.color}20`, border: `1px solid ${statusInfo.color}40` }}>
          <span style={{ color: statusInfo.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        </div>

        <button 
          style={styles.returnButton}
          onClick={() => alert(`Ai returnat cartea: ${loan.book.title}`)}
          onMouseEnter={(e) => { e.target.style.background = '#f3f4f6'; }}
          onMouseLeave={(e) => { e.target.style.background = 'white'; }}
        >
          Returneaza cartea
        </button>
      </div>
    );
  })}
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatarContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 4px 0',
  },
  headerSubtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    padding: '24px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: '#f5f0e8',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  },
  statIcon: {
    flexShrink: 0,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4a3f35',
    margin: '0 0 4px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b5d52',
    margin: 0,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
  },
  section: {
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
  },
  card: {
    background: '#f5f0e8',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  infoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px 0',
  },
  infoValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500',
    margin: 0,
  },
  editButton: {
    width: '100%',
    marginTop: '20px',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  loansContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  loanCard: {
    background: '#f5f0e8',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  loanHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  bookCover: {
    width: '60px',
    height: '80px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  loanInfo: {
    flex: 1,
    minWidth: 0,
  },
  bookTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bookAuthor: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  loanDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statusBadge: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px',
    display: 'inline-block',
  },
  returnButton: {
    width: '100%',
    padding: '10px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default ProfilePage;