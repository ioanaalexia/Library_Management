import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './graphql/client'; // Importă clientul configurat anterior
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
function App() {
  return (
   <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;