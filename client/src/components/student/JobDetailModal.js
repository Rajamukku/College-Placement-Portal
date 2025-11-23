import React from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon, BuildingOffice2Icon, CurrencyRupeeIcon, AcademicCapIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const JobDetailModal = ({ job, onClose, onApply }) => {
    if (!job) return null;

    const handleApply = () => onApply(job._id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">{job.title}</h2>
                        <p className="text-md text-text-secondary font-medium">{job.company?.name || job.company}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    <p className="text-text-primary leading-relaxed">
                        {job.description || "No job description provided. This section would contain detailed information about the role, responsibilities, and what the company is looking for in a candidate."}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start"><BuildingOffice2Icon className="h-5 w-5 mr-3 text-accent flex-shrink-0 mt-1" /><span className="font-semibold text-text-primary mr-2">Location:</span> {job.location}</div>
                        <div className="flex items-start"><CurrencyRupeeIcon className="h-5 w-5 mr-3 text-success flex-shrink-0 mt-1" /><span className="font-semibold text-text-primary mr-2">Package:</span> {job.package}</div>
                        <div className="flex items-start col-span-full"><AcademicCapIcon className="h-5 w-5 mr-3 text-warning flex-shrink-0 mt-1" /><span className="font-semibold text-text-primary mr-2">Eligibility:</span> {job.eligibility || "As per university placement policy."}</div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-primary flex items-center mb-2"><WrenchScrewdriverIcon className="h-5 w-5 mr-2"/>Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(job.skills) ? job.skills : (typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : [])).map(skill => (
                                <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t mt-auto">
                    <button 
                        onClick={handleApply}
                        disabled={job.isApplied}
                        className={`w-full py-3 px-4 font-bold rounded-lg transition-colors ${
                            job.isApplied 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-secondary text-white hover:bg-opacity-90'
                        }`}
                    >
                        {job.isApplied ? 'Already Applied' : 'Apply Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;