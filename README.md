# Library Management App

A full-stack web application for managing library operations, including user authentication, book inventory management, and loan tracking. The project uses a **React** frontend and a **GraphQL (Apollo Server)** backend with **JSON-based persistence**.

## Features

### User Management

* **Roles:** Supports `ADMIN` and `MEMBER` roles.
* **Authentication:** Secure login and registration.
* **Profile Page:** Users can view their personal information and a list of currently borrowed books.

### Book Management

* **Inventory:** View a list of books with details like title, author, and category.
* **Filtering:** Filter books by category or availability status.
* **Admin Controls:** Admins can add, update, and delete books directly through the interface.

### Loan System

* **Borrowing:** Members can borrow available books.
* **Validation:** Prevents borrowing books that are already out on loan.
* **Tracking:** Loans link users to specific books with timestamps.

---

## Technical Stack

* **Frontend:** React, Apollo Client, React Router, Lucide-React (Icons).
* **Backend:** Node.js, Apollo Server, GraphQL.
* **Database:** Flat-file JSON system for data persistence.

---

## Setup Instructions

### 1. Backend Setup

1. Navigate to the `backend` folder.
2. Install dependencies:
```bash
npm install

```


3. Ensure `users.json` , `books.json` and `loans.json` exist in `backend/src/`.
4. Start the server:
```bash
node src/index.js

```

### 2. Frontend Setup

1. Navigate to the `frontend` folder.
2. Install dependencies:
```bash
npm install

```

3. Start the development server:
```bash
npm run dev

```

## GraphQL API Operations

### Queries

* `user`: Returns the currently authenticated user's details.
* `books`: Lists all books.

### Mutations

* `login(username, password)`: Authenticates user and returns a token.
* `addBook(title, author, category)`: (Admin only) Adds a new book to the JSON database.
* `updateBook(id, ...updates)`: (Admin only) Updates details of an existing book.
* `deleteBook(id)`: (Admin only) Removes a book from the system.
* `borrowBook(bookId)`: Marks a book as borrowed by the current user.

---

## Security & Validations

* **Role-Based Access Control:** Critical operations like `addBook` or `deleteBook` are restricted to users with the `ADMIN` role in the GraphQL context.
* **State Persistence:** All changes are immediately written to JSON files, ensuring data is not lost on server restart.
* **Authentication:** Uses the `Authorization` header to pass the user's token (username) from the frontend to the backend context.
