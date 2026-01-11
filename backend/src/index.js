const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
    context: ({ req }) => {
    const username = req.headers.authorization || '';
    const user = users.find(u => u.username === username);
    return { user };
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`url: ${url}`);
});
