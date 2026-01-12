import React, { useState, useEffect } from 'react';
import { Book, Search, Filter, BookOpen, User, ShoppingCart, Heart, Eye, UserCircle, Plus, LogOut, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';


const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      author
      category
      status
    }
  }
`;

const BORROW_BOOK = gql`
  mutation BorrowBook($bookId: ID!, $userId: ID!) { # Changed String! to ID!
    borrowBook(bookId: $bookId, userId: $userId) {
      id
      book {
        id      # Added id for cache consistency
        title
        status
      }
      borrowedAt
      dueDate   # Added this to match the backend Loan type
      # REMOVED the 'user' field entirely because it's not in your backend 'Loan' type
    }
  }
`;

const ADD_BOOK = gql`
  mutation AddBook($title: String!, $author: String!, $category: String!) {
    addBook(title: $title, author: $author, category: $category) { id title }
  }
`;

const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $title: String, $author: String, $category: String, $status: String) {
    updateBook(id: $id, title: $title, author: $author, category: $category, status: $status) {
      id
      title
      status
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) { deleteBook(id: $id) }
`;

const BooksPage = () => {
    const client = useApolloClient(); 

  const { loading, error, data, refetch } = useQuery(GET_BOOKS);
  const [borrowBook] = useMutation(BORROW_BOOK);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [userRole, setUserRole] = useState('MEMBER');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [addBook] = useMutation(ADD_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);
  const [updateBook] = useMutation(UPDATE_BOOK);

  const navigate = useNavigate();


  
  const handleDeleteBook = async (bookId) => {
  if (window.confirm('Esti sigur ca vrei sa stergi aceasta carte?')) {
    try {
      await deleteBook({ variables: { id: bookId } });
      setBooks(books.filter(b => b.id !== bookId)); // UI update
      alert("Carte ștearsă!");
    } catch (e) { alert("Eroare la ștergere"); }
  }
};
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Eroare: Utilizatorul nu este autentificat. Te rugam sa te loghezi.');
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    if (data) {
      setBooks(data.books);
    }
  }, [data]);

  const handleBorrow = async (bookId) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Utilizatorul nu este autentificat!');
    return;
  }

  try {
    console.log('Trimitem mutația...', { bookId, userId });
    const res = await client.mutate({
      mutation: BORROW_BOOK,
      variables: { bookId: String(bookId), userId: localStorage.getItem('userId') }
    });

    console.log('Rezultatul mutației:', res);

    setBooks(prevBooks =>
      prevBooks.map(b =>
        b.id === bookId ? { ...b, status: 'BORROWED' } : b
      )
    );

    alert(`Cartea "${res.data.borrowBook.book.title}" a fost împrumutată!`);
  } catch (error) {
    console.error('Eroare la mutație:', error);
    if (error.networkError && error.networkError.result) {
      console.error('Detalii server:', error.networkError.result);
      alert('Eroare server: ' + JSON.stringify(error.networkError.result.errors));
    } else if (error.graphQLErrors) {
      console.error('GraphQL Errors:', error.graphQLErrors);
      alert('Eroare GraphQL: ' + JSON.stringify(error.graphQLErrors));
    } else {
      alert('Nu s-a putut împrumuta cartea!');
    }
  }
};

  const goToProfile = () => {
    navigate('/profile'); // Navigate to the profile page
  };

  const handleAddBook = () => {
    setShowAddModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      status: book.status
    });
    setShowAddModal(true);
  };



  const handleSaveBook = async () => {
  const { title, author, category, status } = bookFormData;

  if (!title || !author) {
    alert("Titlul și autorul sunt obligatorii!");
    return;
  }

  try {
    if (editingBook) {
      await updateBook({
        variables: { id: editingBook.id, title, author, category, status },
      });
      alert('Carte actualizată!');
    } else {
      await addBook({
        variables: { title, author, category },
      });
      alert('Carte adăugată!');
    }
    
    await refetch();
    handleCloseModal();
  } catch (err) {
    alert("Eroare: " + err.message);
  }
};

  const [bookFormData, setBookFormData] = useState({
  title: '',
  author: '',
  category: '',
  status: 'AVAILABLE'
});

const handleCloseModal = () => {
  setShowAddModal(false);
  setEditingBook(null);
  setBookFormData({ title: '', author: '', category: '', status: 'AVAILABLE' });
};

  const getStatusBadge = (status) => {
    if (status === 'AVAILABLE') {
      return { text: 'Disponibila', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    } 
    // Safety fallback: if status is 'BORROWED' or anything else, show red
    return {
      text: status === 'BORROWED' ? 'Imprumutata' : 'Indisponibila',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    };
  };

  const categories = ['all', 'Roman Românesc', 'Roman', 'Nuvelă'];
  const statuses = [
    { value: 'all', label: 'Toate' },
    { value: 'AVAILABLE', label: 'Disponibile' },
    { value: 'BORROWED', label: 'Împrumutate' }
  ];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <p>Se încarcă...</p>;
  if (error) return <p>Eroare la încărcarea datelor!</p>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <BookOpen size={40} color="white" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Colecția de Cărți</h1>
              <p style={styles.headerSubtitle}>
                {filteredBooks.length} cărți găsite • {userRole === 'ADMIN' ? 'Mod Administrator' : 'Mod Membru'}
              </p>
            </div>
          </div>

          <div style={styles.headerActions}>
            {userRole === 'ADMIN' ? (
              <>
                <button onClick={handleAddBook} style={styles.addButton}>
                  <Plus size={20} /> Adaugă carte
                </button>
                <button 
                  onClick={() => { localStorage.clear(); navigate('/login'); }} 
                  style={styles.profileButton}
                >
                  <LogOut size={20} /> Deconectare
                </button>
              </>
            ) : (
              <button onClick={goToProfile} style={styles.profileButton}>
                <UserCircle size={24} /> 
                <span>Profilul meu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.filtersContainer}>
          <div style={styles.searchBox}>
            <Search size={20} color="#6b7280" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cauta după titlu sau autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filtersRow}>
            <div style={styles.filterGroup}>
              <Filter size={16} color="#6b7280" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">Toate categoriile</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <Book size={16} color="#6b7280" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={styles.filterSelect}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.booksGrid}>
          {filteredBooks.map((book) => {

            const statusBadge = getStatusBadge(book.status);
              
            return (
              <div 
                key={book.id} 
                style={styles.bookCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Cover */}
                <div style={{...styles.bookCover, background: book.coverColor}}>
                  <Book size={48} color="white" />
                  <div style={styles.coverOverlay}>
                    <button 
                      style={styles.quickViewButton}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <div style={styles.bookContent}>
                  <div style={{...styles.statusBadge, background: statusBadge.bg, color: statusBadge.color}}>
                      {statusBadge.text}
                    </div>

                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>
                    <User size={14} style={styles.inlineIcon} />
                    {book.author}
                  </p>

                  <div style={styles.categoryTag}>
                    {book.category}
                  </div>

                  <div style={styles.actionsRow}>
                    {userRole === 'MEMBER' ? (
                      <>
                        <button
                          onClick={() => handleBorrow(book.id)}
                          disabled={book.status === 'BORROWED'}
                          style={{
                            ...styles.borrowButton,
                            ...(book.status === 'BORROWED' ? styles.borrowButtonDisabled : {})
                          }}
                          onMouseEnter={(e) => {
                            if (book.status === 'AVAILABLE') {
                              e.target.style.background = 'linear-gradient(to right, #7c3aed, #db2777)';
                              e.target.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (book.status === 'AVAILABLE') {
                              e.target.style.background = 'linear-gradient(to right, #9333ea, #ec4899)';
                              e.target.style.transform = 'scale(1)';
                            }
                          }}
                        >
                          <ShoppingCart size={16} />
                          {book.status === 'AVAILABLE' ? 'Împrumută' : 'Indisponibilă'}
                        </button>
                        
                        <button
                          style={styles.favoriteButton}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#fee2e2';
                            e.target.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#f9fafb';
                            e.target.style.color = '#6b7280';
                          }}
                        >
                          <Heart size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditBook(book)}
                          style={styles.editButton}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(to right, #7c3aed, #db2777)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(to right, #9333ea, #ec4899)';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          <Edit2 size={16} />
                          Editează
                        </button>
                        
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          style={styles.deleteButton}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#dc2626';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#ef4444';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 size={16} />
                          Șterge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBooks.length === 0 && (
          <div style={styles.noResults}>
            <Book size={64} color="#d1d5db" />
            <h3 style={styles.noResultsTitle}>Nu am găsit nicio carte</h3>
            <p style={styles.noResultsText}>Incearca sa modifici filtrele sau termenii de cautare</p>
          </div>
        )}
      </div>

      {showAddModal && userRole === 'ADMIN' && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingBook ? 'Editează Carte' : 'Adaugă Carte Nouă'}
              </h2>
              <button onClick={handleCloseModal} style={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Titlu *</label>
                <input
                  type="text"
                  placeholder="Titlul cărții"
                  // defaultValue={editingBook?.title}
                  // style={styles.modalInput}
                  value={bookFormData.title}
                  onChange={(e) => setBookFormData({...bookFormData, title: e.target.value})}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Autor *</label>
                <input
                  type="text"
                  placeholder="Numele autorului"
                  value={bookFormData.author}
                  onChange={(e) => setBookFormData({...bookFormData, author: e.target.value})}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Categorie *</label>
                <input
                  type="text"
                  placeholder="Ex: Roman Românesc"
                  value={bookFormData.category}
                  onChange={(e) => setBookFormData({...bookFormData, category: e.target.value})}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status *</label>
                <select defaultValue={editingBook?.status || 'AVAILABLE'} style={styles.modalSelect}>
                  <option value="AVAILABLE">Disponibila</option>
                  <option value="BORROWED">Imprumutata</option>
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={handleCloseModal} style={styles.cancelButton}>
                Anulează
              </button>
              <button onClick={handleSaveBook} style={styles.saveButton}>
                {editingBook ? 'Actualizeaza' : 'Adauga'}
              </button>
            </div>
          </div>
        </div>
      )}
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
    maxWidth: '1400px',
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
  headerIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
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
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  filtersContainer: {
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none',
  },
  filtersRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
  filterSelect: {
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    cursor: 'pointer',
    outline: 'none',
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
  },
  bookCard: {
    background: '#f5f0e8',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  bookCover: {
    height: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  coverOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  quickViewButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
  },
  bookContent: {
    padding: '24px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  bookTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bookAuthor: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  inlineIcon: {
    flexShrink: 0,
  },
  bookDescription: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  categoryTag: {
    display: 'inline-block',
    padding: '6px 12px',
    background: 'rgba(147, 51, 234, 0.1)',
    color: '#9333ea',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  actionsRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  borrowButton: {
    flex: 1,
    padding: '12px 20px',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  borrowButtonDisabled: {
    background: '#d1d5db',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  editButton: {
    flex: 1,
    padding: '12px 20px',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  deleteButton: {
    flex: 1,
    padding: '12px 20px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  favoriteButton: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#6b7280',
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  noResultsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '20px 0 10px 0',
  },
  noResultsText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  modalBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  modalInput: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  modalSelect: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
    cursor: 'pointer',
    background: 'white',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '10px',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  saveButton: {
    padding: '12px 24px',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default BooksPage;