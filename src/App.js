import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import AppContent from './AppContent';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}
export default App;