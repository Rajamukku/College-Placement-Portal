import React from 'react';
import { Link } from 'react-router-dom';
import PULogo from '../assets/pu-logo.png';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <img src={PULogo} alt="Parul University Logo" className="h-24 w-auto mb-4" />
      <h1 className="text-4xl md:text-5xl font-bold text-pu-blue text-center">
        College Placement Portal
      </h1>
      <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl">
        Your gateway to career opportunities. Connect with top companies and find your dream job.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <PortalCard
          title="Student Portal"
          description="Browse jobs, build your resume with AI, and track applications."
          linkTo="/student/login"
        />
        <PortalCard
          title="Company Portal"
          description="Post jobs, screen candidates with AI assistance, and manage applicants."
          linkTo="/company/login"
        />
        <PortalCard
          title="Admin Portal"
          description="Manage student and company profiles, and view placement reports."
          linkTo="/admin/login"
        />
      </div>
    </div>
  );
};

const PortalCard = ({ title, description, linkTo }) => (
  <Link
    to={linkTo}
    className="group block p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
  >
    <h2 className="text-2xl font-bold text-pu-blue">{title}</h2>
    <p className="mt-2 text-gray-500">{description}</p>
    <div className="mt-6 flex items-center text-pu-orange font-semibold">
      Go to Portal
      <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
    </div>
  </Link>
);

export default Home;