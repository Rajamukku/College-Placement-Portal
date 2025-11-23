// File: client/src/components/common/Header.js

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PULogo from '../../assets/pu-logo.png';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const navLinks = {
  admin: [
    { name: 'Dashboard', to: '/admin/dashboard' },
    { name: 'Students', to: '/admin/students' },
    { name: 'Companies', to: '/admin/companies' },
    { name: 'Jobs', to: '/admin/jobs' },
    { name: 'Reports', to: '/admin/reports' },
    { name: 'Security', to: '/admin/security' },
  ],
  student: [
    { name: 'Dashboard', to: '/student/dashboard' },
    { name: 'Jobs', to: '/student/jobs' },
    { name: 'Companies', to: '/student/companies' },
    { name: 'Applications', to: '/student/applications' },
    { name: 'Profile', to: '/student/profile' },
  ],
  company: [
    { name: 'Dashboard', to: '/company/dashboard' },
    { name: 'Post Job', to: '/company/post-job' },
    { name: 'My Postings', to: '/company/postings' },
    { name: 'Applicants', to: '/company/applicants' },
    { name: 'Pipeline', to: '/company/pipeline' },
    { name: 'Analytics', to: '/company/analytics' },
    { name: 'Profile', to: '/company/profile' },
  ],
};

const Header = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const links = navLinks[userType] || [];

  const handleLogout = () => {
    // FIXED: Standardized localStorage keys for removal
    localStorage.removeItem('token');
    // It's good practice to remove any other related user data
    localStorage.removeItem('userRole'); // If you are setting this anywhere

    // Redirect to the appropriate login page based on user type
    const loginPath = userType === 'admin' ? '/admin/login' : '/login';
    navigate(loginPath);
  };

  return (
    <header className="bg-surface shadow-md sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to={`/${userType}/dashboard`}>
                <img className="h-12 w-auto" src={PULogo} alt="Parul University" />
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {links.map((link) => {
                  // Highlight the active link
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.name}
                      to={link.to}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                        ? 'bg-pu-blue text-white' 
                        : 'text-text-secondary hover:bg-gray-100 hover:text-primary'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-text-secondary hover:text-danger px-3 py-2 rounded-md text-sm font-medium transition-colors">
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;