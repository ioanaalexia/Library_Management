const books = [];
const users = [
  { id: "1", username: "admin", password: "admin", role: "ADMIN" },
  { id: "2", username: "member", password: "member", role: "MEMBER" }
];
const loans = [];

const resolvers = {
  Query: {
    users: () => users,
    me: (_, __, context) => context.user,
    books: () => books,

    booksByFilter: (_, { category, status }) => {
      return books.filter(book => {
        if (category && book.category !== category) return false;
        if (status && book.status !== status) return false;
        return true;
      });
    },

    book: (_, { id }) => books.find(b => b.id === id),

    loans: () => loans,

    paginatedBooks: (_, { page, limit }) => {
      const start = (page - 1) * limit;
      return books.slice(start, start + limit);
    }
  },

  Mutation: {
    register: (_, { username, password, role }) => {
      if (!username || !password || !role) {
        throw new Error("Required fields cannot be null");
      }
      const existingUser = users.find(u => u.username === username);
      if (existingUser) throw new Error("User already exists");

      const user = { id: String(users.length + 1), username, password, role };
      users.push(user);
      return user;
    },

    login: (_, { username, password }) => {
      const user = users.find(u => u.username === username);
      if (!user) {
        throw new Error("User not found"); 
      }
      if (user.password !== password) {
        throw new Error("Invalid password");
      }
      return user.username;
    },

    addBook: (_, { title, author, category }) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
      }

      if (!title || !author || !category) {

        throw new Error("Required fields cannot be null");
      }

      const book = {
        id: String(books.length + 1),
        title,
        author,
        category,
        status: "AVAILABLE"
      };

      books.push(book);
      return book;
    },

    updateBook: (_, { id, ...updates }) => {
      const book = books.find(b => b.id === id);
      if (!book) throw new Error("Book not found");

      Object.assign(book, updates);
      return book;
    },

    deleteBook: (_, { id }) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
      }
      

      const index = books.findIndex(b => b.id === id);
      if (index === -1) return false;

      books.splice(index, 1);
      return true;
    },

    borrowBook: (_, { bookId, userId }) => {
      const book = books.find(b => b.id === bookId);
      const user = users.find(u => u.id === userId);
      
      if (!book || !user) throw new Error("Book or User not found");

      if (book.status === "BORROWED") {
        throw new Error("Book already borrowed");
      }

      book.status = "BORROWED";

      const loan = {
        id: String(loans.length + 1),
        user,
        book,
        borrowedAt: new Date().toISOString(),
        returnedAt: null
      };

      loans.push(loan);
      return loan;
    },

    returnBook: (_, { loanId }) => {
      const loan = loans.find(l => l.id === loanId);
      if (!loan) throw new Error("Loan not found");

      loan.returnedAt = new Date().toISOString();
      loan.book.status = "AVAILABLE";

      return loan;
    }
  }
};

module.exports = { users, books, loans, resolvers };
