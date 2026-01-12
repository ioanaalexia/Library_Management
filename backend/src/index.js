const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');

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
  }

  type Mutation {
    login(username: String!, password: String!): String
    register(username: String!, password: String!): String
  }
`;


const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    greet: (_, { name }) => `Hello, ${name}!`,
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
      const newUser = { username, password };
      users.push(newUser);
      console.log('New user added:', newUser); 
      console.log('Updated users array:', users);
      saveUsers(); 
      console.log('Users saved to JSON file');
      return `User ${username} registered successfully!`;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
