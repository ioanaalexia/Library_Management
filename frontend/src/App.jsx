import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './graphql/client'; // Importă clientul configurat anterior
import LoginPage from './pages/LoginPage';

function App() {
  return (
   <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;