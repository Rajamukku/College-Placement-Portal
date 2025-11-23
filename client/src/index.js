// client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global CSS
import App from './App'; // Your main App component with all the routes

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);