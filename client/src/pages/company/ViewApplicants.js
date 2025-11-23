import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar';
import StudentProfileModal from '../../components/company/StudentProfileModal';
import StatusBadge from '../../components/company/StatusBadge';
import InterviewFeedbackModal from '../../components/company/InterviewFeedbackModal';
import toast from 'react-hot-toast';
import axios from 'axios';
import { SparklesIcon } from '@heroicons/react/24/outline';

const MatchScoreBar = ({ score }) => {
    const safe = Math.max(0, Math.min(100, Number(score) || 0));
    return (
        <div className="w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-success h-2.5 rounded-full"
                    style={{ width: `${safe}%` }}
                />
            </div>
            <div className="text-xs mt-1 text-text-secondary">{safe}% match</div>
        </div>
    );
};

const ViewApplicants = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const jobTitle = searchParams.get('jobTitle');
    
    const [allApplicants, setAllApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedbackStudent, setFeedbackStudent] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ cpi: '', branch: '' });

    const fetchApplicants = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                setIsLoading(false);
                return;
            }
            const config = { headers: { 'x-auth-token': token } };
            
            // If jobId is provided, fetch applicants for that specific job
            // Otherwise, fetch all applicants for all company jobs
            const url = jobId 
                ? `http://localhost:5000/api/jobs/${jobId}/applicants`
                : `http://localhost:5000/api/jobs/applicants`;
                
            const res = await axios.get(url, config);
            if (Array.isArray(res.data)) {
                setAllApplicants(res.data);
            } else {
                setAllApplicants([]);
            }
        } catch (err) {
            console.error('Error fetching applicants:', err);
            const errorMsg = err.response?.data?.msg || err.message || 'Could not fetch applicants.';
            toast.error(errorMsg);
            setAllApplicants([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const filteredApplicants = useMemo(() => {
        let list = Array.isArray(allApplicants) ? allApplicants : [];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(a => (a.name || '').toLowerCase().includes(q) || (a.studentId || '').toLowerCase().includes(q));
        }
        if (filters.cpi) {
            const min = parseFloat(filters.cpi);
            if (!Number.isNaN(min)) list = list.filter(a => Number(a.academics?.cpi || 0) >= min);
        }
        if (filters.branch) {
            list = list.filter(a => (a.branch || '') === filters.branch);
        }
        return list;
    }, [allApplicants, searchQuery, filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const updateApplicantStatus = async (applicationId, newStatus) => {
        const statusMessages = {
            'shortlisted': 'Shortlisting candidate and sending email notification...',
            'interview': 'Scheduling interview and sending email notification...',
            'hired': 'Hiring candidate and sending offer email...',
            'rejected': 'Rejecting application...',
            'applied': 'Updating status...'
        };
        
        const loadingToast = toast.loading(statusMessages[newStatus] || 'Updating status...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/applications/${applicationId}/status`, { status: newStatus }, config);

            // Update local state for immediate UI feedback
            setAllApplicants(prev => prev.map(app => 
                app.applicationId === applicationId ? { ...app, status: newStatus } : app
            ));
            toast.dismiss(loadingToast);
            const successMessages = {
                'shortlisted': 'Candidate shortlisted! Email notification sent.',
                'interview': 'Interview scheduled! Email notification sent.',
                'hired': 'Candidate hired! Offer email sent.',
                'rejected': 'Application rejected.',
            };
            toast.success(successMessages[newStatus] || "Status updated successfully!");
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.msg || "Failed to update status.");
        }
    };
    
    const handleSaveFeedback = (studentId, feedbackData) => { /* no-op placeholder for now */ };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="company" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                 <h1 className="text-3xl font-bold text-text-primary">
                    {jobId && jobTitle ? `Applicants for "${jobTitle}"` : 'All Applicants'}
                 </h1>
                <p className="text-md text-text-secondary mb-8">{allApplicants.length} total application{allApplicants.length !== 1 ? 's' : ''}</p>

                {/* Filter Section */}
                <div className="bg-surface p-4 rounded-lg shadow-card mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search by name or ID..." />
                    <div className="flex items-center gap-3">
                        <select name="branch" value={filters.branch} onChange={handleFilterChange} className="form-select rounded-md">
                            <option value="">All Branches</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                        </select>
                        <input type="number" name="cpi" value={filters.cpi} onChange={handleFilterChange} placeholder="Min CPI" className="form-input rounded-md w-28" />
                    </div>
                </div>

                <div className="bg-surface rounded-lg shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Student</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Branch</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">CPI</th>
                                     {!jobId && <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Job</th>}
                                     <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Match</th>
                                     <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase">Status</th>
                                     <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase">Actions</th>
                                </tr>
                             </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan={jobId ? "6" : "7"} className="text-center py-10 text-gray-500">Loading applicants...</td></tr>
                                ) : filteredApplicants.length === 0 ? (
                                    <tr><td colSpan={jobId ? "6" : "7"} className="text-center py-10 text-gray-500">No applicants found.</td></tr>
                                ) : filteredApplicants.map(app => (
                                    <tr key={`${app._id}-${app.applicationId}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-text-primary">{app.name}</div>
                                            <div className="text-sm text-text-secondary">{app.studentId}</div>
                                        </td>
                                        <td className="px-6 py-4">{app.branch || '—'}</td>
                                        <td className="px-6 py-4">{app.academics?.cpi ?? '—'}</td>
                                        {!jobId && (
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-primary">{app.jobTitle || '—'}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4"><MatchScoreBar score={app.matchScore} /></td>
                                        <td className="px-6 py-4 text-center"><StatusBadge status={app.status} /></td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                <button 
                                                    onClick={() => setSelectedStudent(app)} 
                                                    className="px-3 py-1 text-xs font-medium text-white bg-info rounded hover:bg-opacity-90"
                                                    title="View Full Profile"
                                                >
                                                    View Profile
                                                </button>
                                                {app.status === 'applied' && (
                                                    <button 
                                                        onClick={() => updateApplicantStatus(app.applicationId, 'shortlisted')} 
                                                        className="px-3 py-1 text-xs font-medium text-white bg-success rounded hover:bg-opacity-90"
                                                        title="Shortlist & Send Email"
                                                    >
                                                        Shortlist
                                                    </button>
                                                )}
                                                {app.status === 'shortlisted' && (
                                                    <>
                                                        <button 
                                                            onClick={() => updateApplicantStatus(app.applicationId, 'interview')} 
                                                            className="px-3 py-1 text-xs font-medium text-white bg-warning rounded hover:bg-opacity-90"
                                                            title="Schedule Interview & Send Email"
                                                        >
                                                            Interview
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to hire ${app.name}? This will send a congratulatory email.`)) {
                                                                    updateApplicantStatus(app.applicationId, 'hired');
                                                                }
                                                            }}
                                                            className="px-3 py-1 text-xs font-medium text-white bg-primary rounded hover:bg-opacity-90"
                                                            title="Hire Candidate & Send Offer Email"
                                                        >
                                                            Hire
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === 'interview' && (
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to hire ${app.name}? This will send a congratulatory email.`)) {
                                                                updateApplicantStatus(app.applicationId, 'hired');
                                                            }
                                                        }}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-primary rounded hover:bg-opacity-90"
                                                        title="Hire Candidate & Send Offer Email"
                                                    >
                                                        Hire
                                                    </button>
                                                )}
                                                {app.status !== 'rejected' && app.status !== 'hired' && (
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to reject ${app.name}?`)) {
                                                                updateApplicantStatus(app.applicationId, 'rejected');
                                                            }
                                                        }}
                                                        className="px-3 py-1 text-xs font-medium text-white bg-danger rounded hover:bg-opacity-90"
                                                        title="Reject Application"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                {(app.status === 'hired' || app.status === 'rejected') && (
                                                    <span className="px-3 py-1 text-xs font-medium text-gray-600 italic">
                                                        {app.status === 'hired' ? 'Hired' : 'Rejected'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            
            {/* Student Profile Modal */}
            {selectedStudent && (
                <StudentProfileModal 
                    student={selectedStudent} 
                    onClose={() => setSelectedStudent(null)} 
                />
            )}
            
            {/* Interview Feedback Modal */}
            {feedbackStudent && (
                <InterviewFeedbackModal 
                    student={feedbackStudent} 
                    onClose={() => setFeedbackStudent(null)}
                    onSave={handleSaveFeedback}
                />
            )}
        </div>
    );
};

export default ViewApplicants;