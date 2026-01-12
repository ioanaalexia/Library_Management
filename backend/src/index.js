const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

console.log('Starting Apollo Server...');

const usersFile = path.join(__dirname, 'users.json');
const booksFile = path.join(__dirname, 'books.json');

let loans = [];
let users = [];

if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

const saveUsers = () => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const typeDefs = gql`
  type Query {
    hello: String
    greet(name: String!): String
    user(username: String!): User
    books: [Book!]!
  }

  type Mutation {
    login(username: String!, password: String!): String
    register(username: String!, password: String!): String
    borrowBook(bookId: ID!, userId: String!): Loan
  }

  type User {
    id: ID!
    name: String
    email: String
    phone: String
    address: String
    memberSince: String
    totalBorrowedBooks: Int
    currentlyBorrowed: Int
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
    dueDate: String
    book: Book!
    user: User!
  }
`;


const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    greet: (_, { name }) => `Hello, ${name}!`,
    user: (_, { username }) => {
  const user = users.find(u => u.username === username);
  if (!user) throw new Error('User not found');

  const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));

  const activeLoans = books
    .filter(b => b.status === 'BORROWED')
    .map(b => ({
      id: uuidv4(),
      borrowedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      book: {
        title: b.title,
        author: b.author,
        coverColor: b.coverColor || '#776248'
      }
    }));

  return {
    id: user.id,
    name: user.username,
    email: 'example@email.com',
    phone: '+40 712 345 678',
    address: 'Iași, România',
    memberSince: '15 Ianuarie 2024',
    totalBorrowedBooks: activeLoans.length + 20,
    currentlyBorrowed: activeLoans.length,
    activeLoans
  };
},
    books: () => {
      return JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
    },
  },
  Mutation: {
    login: (_, { username, password }) => {
      const user = users.find(u => u.username === username);
      if (!user) {
        throw new Error('User not found');
      }
      if (user.password !== password) {
        throw new Error('Invalid password');
      }
      return `Welcome, ${username}!`;
    },
    register: (_, { username, password }) => {
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        throw new Error('User already exists');
      }
      const newUser = { id: uuidv4(), username, password };
      users.push(newUser);
      console.log('New user added:', newUser); 
      console.log('Updated users array:', users);
      saveUsers(); 
      console.log('Users saved to JSON file');
      return `User ${username} registered successfully!`;
    },
    borrowBook: (_, { bookId, userId }) => {
  console.log('Request received with variables:', { bookId, userId });

  const books = JSON.parse(fs.readFileSync(booksFile, 'utf-8'));
  const book = books.find((b) => b.id === bookId);
  const user = users.find((u) => u.id === userId);

  if (!book) {
    throw new Error('Cartea nu a fost găsită.');
  }

  if (!user) {
    throw new Error('Utilizatorul nu a fost găsit.');
  }

  if (book.status === 'BORROWED') {
    throw new Error('Cartea este deja împrumutată.');
  }

  // Creăm obiectul împrumutului
  const loan = {
        id: uuidv4(),
        bookId,
        userId,
        borrowedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString()
      };
    
  loans.push(loan);

  book.status = 'BORROWED';
  fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

  console.log(`Cartea ${book.title} a fost împrumutată de ${user.username}`);

  return {
    id: loan.id,
    book,
    user,
    borrowedAt: loan.borrowedAt,
    dueDate: loan.dueDate
  };
}
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
