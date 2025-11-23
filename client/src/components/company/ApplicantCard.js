import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

const ApplicantCard = ({ applicant }) => {
    const isRecommended = applicant.aiRecommended;

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 transition-all duration-300 ${isRecommended ? 'border-pu-orange shadow-orange-100' : 'border-transparent'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-bold text-pu-blue">{applicant.name}</p>
                        {isRecommended && (
                            <span className="flex items-center gap-1 bg-orange-100 text-pu-orange text-xs font-semibold px-2.5 py-1 rounded-full">
                                <SparklesIcon className="h-4 w-4"/> AI Recommended
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">{applicant.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {applicant.skills.map(skill => (
                            <span key={skill} className="bg-pu-light-blue text-pu-blue text-xs font-semibold px-2.5 py-1 rounded-full">{skill}</span>
                        ))}
                    </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                    <button className="bg-green-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-green-600 transition-colors">Shortlist</button>
                    <button className="bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-red-600 transition-colors">Reject</button>
                    <a href={applicant.resumeLink} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-700 text-sm font-semibold py-1 px-3 rounded-md hover:bg-gray-300 transition-colors">Resume</a>
                </div>
            </div>
        </div>
    );
};

export default ApplicantCard;