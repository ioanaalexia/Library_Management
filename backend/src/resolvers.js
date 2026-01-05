const books = [];
const users = [];
const loans = [];

const resolvers = {
  Query: {
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
    login: (_, { username, password }) => {
      if (!username || !password) {
        throw new Error("Invalid authentication");
      }
      return "mock-jwt-token";
    },

    addBook: (_, { title, author, category }) => {
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
      const index = books.findIndex(b => b.id === id);
      if (index === -1) return false;

      books.splice(index, 1);
      return true;
    },

    borrowBook: (_, { bookId, userId }) => {
      const book = books.find(b => b.id === bookId);
      if (!book) throw new Error("Book not found");

      if (book.status === "BORROWED") {
        throw new Error("Book already borrowed");
      }

      book.status = "BORROWED";

      const loan = {
        id: String(loans.length + 1),
        user: { id: userId, username: "mockUser", role: "MEMBER" },
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

module.exports = resolvers;
