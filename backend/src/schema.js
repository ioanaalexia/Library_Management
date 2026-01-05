const { gql } = require("apollo-server");

const typeDefs = gql`
  enum Role {
    ADMIN
    MEMBER
  }

  enum BookStatus {
    AVAILABLE
    BORROWED
  }

  # Object Types
  type User {
    id: ID!
    username: String!
    role: Role!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    category: String!
    status: BookStatus!
  }

  type Loan {
    id: ID!
    user: User!
    book: Book!
    borrowedAt: String!
    returnedAt: String
  }

  # Queries
  type Query {
    books: [Book!]!
    booksByFilter(category: String, status: BookStatus): [Book!]!
    book(id: ID!): Book
    loans: [Loan!]!
    paginatedBooks(page: Int!, limit: Int!): [Book!]!
  }

  # Mutations
  type Mutation {
    login(username: String!, password: String!): String!

    addBook(
      title: String!
      author: String!
      category: String!
    ): Book!

    updateBook(
      id: ID!
      title: String
      author: String
      category: String
      status: BookStatus
    ): Book!

    deleteBook(id: ID!): Boolean!

    borrowBook(bookId: ID!, userId: ID!): Loan!
    returnBook(loanId: ID!): Loan!
  }
`;

module.exports = typeDefs;
