import React from 'react';
import { MapPinIcon, CurrencyRupeeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const JobCard = ({ job }) => {
  const companyName = job.company?.name || job.company || '';
  const skills = Array.isArray(job.skills)
    ? job.skills
    : (typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

  return (
    <div className={`bg-surface rounded-lg shadow-card hover:shadow-card-hover p-6 flex flex-col transition-all duration-300 group h-full ${job.isApplied && 'opacity-60'}`}>
      <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{job.title}</h3>
      <p className="text-md font-medium text-text-secondary mt-1">{companyName}</p>
      
      <div className="flex items-center text-text-secondary mt-4 text-sm">
        <MapPinIcon className="h-5 w-5 mr-1.5 text-accent" /> {job.location}
      </div>
      <div className="flex items-center text-text-secondary mt-1 text-sm">
        <CurrencyRupeeIcon className="h-5 w-5 mr-1.5 text-success" /> {job.package}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.slice(0, 3).map(skill => (
          <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        {job.isApplied ? (
            <div className="flex items-center justify-center gap-2 w-full bg-success/10 text-success font-bold py-2.5 px-4 rounded-md">
                <CheckCircleIcon className="h-5 w-5"/>
                Applied
            </div>
        ) : (
            <div className="w-full bg-secondary text-white font-bold py-2.5 px-4 rounded-md text-center group-hover:bg-opacity-90 transition-all duration-300 transform group-hover:scale-105">
                View Details
            </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;