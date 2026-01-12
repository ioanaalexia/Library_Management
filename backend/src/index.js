const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const usersFile = path.join(__dirname, 'users.json');
const booksFile = path.join(__dirname, 'books.json');
const loansFile = path.join(__dirname, 'loans.json'); 


const readData = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    activeLoans: [Loan!]!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    category: String!
    status: String!
  }

  type Loan {
    id: ID!
    borrowedAt: String!
    dueDate: String!
    book: Book!
  }

  type AuthPayload {
    id: ID!
    role: String!
    username: String!
    message: String!
  }

  type Query {
    user(id: ID!): User
    books: [Book!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    register(username: String!, password: String!, email: String): String
    borrowBook(bookId: ID!, userId: ID!): Loan
    returnBook(bookId: ID!, userId: ID!): Boolean
    addBook(title: String!, author: String!, category: String!): Book
    deleteBook(id: ID!): Boolean
    updateBook(id: ID!, title: String, author: String, category: String, status: String): Book
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => {
      const users = readData(usersFile);
      const user = users.find(u => u.id === id);
      if (!user) throw new Error('Utilizator negăsit');

      const loans = readData(loansFile);
      const books = readData(booksFile);

      const userLoans = loans
        .filter(l => l.userId === id)
        .map(loan => ({
          ...loan,
          book: books.find(b => b.id === loan.bookId)
        }));

      return { ...user, activeLoans: userLoans };
    },
    books: () => readData(booksFile),
  },
  Mutation: {
    login: (_, { username, password }) => {
  const users = readData(usersFile);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) throw new Error('Date de logare incorecte');
  
  return { 
    id: user.id, 
    username: user.username, 
    role: user.role || "MEMBER", 
    message: "Logare reușită" 
  };
},
    register: (_, { username, password, email }) => { // <--- Add email here
      const users = readData(usersFile);
      if (users.find(u => u.username === username)) throw new Error('Utilizatorul există deja');

      const newUser = {
        id: uuidv4(),
        username,
        password,
        email: email || "", 
        role: "MEMBER"
      };

      users.push(newUser);
      writeData(usersFile, users);
      return "Cont creat cu succes!";
    },
    borrowBook: (_, { bookId, userId }) => {
      const books = readData(booksFile);
      const loans = readData(loansFile);
      const bookIndex = books.findIndex(b => b.id === bookId);

      if (books[bookIndex].status === 'BORROWED') throw new Error('Cartea este deja împrumutată');

      const newLoan = {
        id: uuidv4(),
        userId,
        bookId,
        borrowedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      loans.push(newLoan);
      books[bookIndex].status = 'BORROWED';

      writeData(loansFile, loans);
      writeData(booksFile, books);

      return { ...newLoan, book: books[bookIndex] };
    },
    returnBook: (_, { bookId, userId }) => {
  let loans = readData(loansFile);
  const books = readData(booksFile);

  // (convert to String just in case)
  const filteredLoans = loans.filter(l => 
    !(String(l.bookId) === String(bookId) && String(l.userId) === String(userId))
  );
  
  if (filteredLoans.length === loans.length) {
    console.log("No loan found for:", { bookId, userId });
    throw new Error('Împrumutul nu a fost găsit');
  }

  // Update book status
  const book = books.find(b => String(b.id) === String(bookId));
  if (book) {
    book.status = 'AVAILABLE';
  }

  writeData(loansFile, filteredLoans);
  writeData(booksFile, books);
  return true;
},

addBook: (_, { title, author, category }) => {
  const books = readData(booksFile);
    // convert ids to numbers to find the max, then back to a string
  const maxId = books.length > 0 
    ? Math.max(...books.map(b => parseInt(b.id) || 0)) 
    : 0;

  const newBook = {
    id: String(maxId + 1),
    title,
    author,
    category,
    status: 'AVAILABLE'
  };

  books.push(newBook);
  writeData(booksFile, books);
  return newBook;
},

  deleteBook: (_, { id }) => {
    const books = readData(booksFile);
    const filteredBooks = books.filter(b => b.id !== id);
    if (books.length === filteredBooks.length) return false;
    writeData(booksFile, filteredBooks);
    return true;
  },

  updateBook: (_, { id, ...updates }) => {
    const books = readData(booksFile);
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Cartea nu a fost găsită");
    
    books[index] = { ...books[index], ...updates };
    writeData(booksFile, books);
    return books[index];
  }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`));