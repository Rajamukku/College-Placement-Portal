import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-pu-blue tracking-widest">404</h1>
        <div className="bg-pu-orange px-2 text-sm rounded rotate-12 absolute">
          Page Not Found
        </div>
        <p className="mt-4 text-gray-500">The page you are looking for does not exist.</p>
        <Link 
          to="/" 
          className="mt-6 inline-block bg-pu-orange text-white font-semibold px-6 py-3 rounded-md hover:bg-orange-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;