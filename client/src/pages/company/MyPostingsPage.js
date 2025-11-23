import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // <-- Step 1: Import axios
import Header from '../../components/common/Header';
import StatusBadge from '../../components/company/StatusBadge';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Step 2: REMOVE the import from the mock database
// import { getCompanyJobs, closeJob } from '../../mockDatabase'; 

const MyPostingsPage = () => {
    // Step 3: Add state for loading and jobs
    const [myJobs, setMyJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Step 4: Use useEffect to fetch data when the component loads
    useEffect(() => {
        const fetchCompanyJobs = async () => {
            try {
                // Step 5: Get the authentication token from local storage
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error("You must be logged in to view this page.");
                    setIsLoading(false);
                    return;
                }

                // Step 6: Create the request headers with the token
                const config = {
                    headers: {
                        'x-auth-token': token, // The backend middleware expects this header
                    },
                };

                // Step 7: Make the API call to your backend
                const res = await axios.get('http://localhost:5000/api/jobs/my-postings', config);
                
                // Step 8: Set the component's state with the data from the backend
                setMyJobs(Array.isArray(res.data) ? res.data : []);

            } catch (err) {
                // Step 9: Handle errors gracefully
                toast.error(err.response?.data?.msg || 'Failed to fetch job postings.');
                console.error(err);
            } finally {
                // Step 10: Set loading to false whether the request succeeded or failed
                setIsLoading(false);
            }
        };

        fetchCompanyJobs();
    }, []); // The empty dependency array means this effect runs only once

    // This function would also need to be converted to an API call
    const handleCloseJob = async (jobId, jobTitle) => {
        if (window.confirm(`Are you sure you want to close the job posting for "${jobTitle}"?`)) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                // Example of a PUT request to update the job status
                await axios.put(`http://localhost:5000/api/jobs/${jobId}`, { status: 'Closed' }, config);
                
                // Refresh the list to show the change
                setMyJobs(myJobs.map(job => job._id === jobId ? { ...job, status: 'Closed' } : job));
                toast.success(`Job "${jobTitle}" has been closed.`);
            } catch (err) {
                toast.error('Failed to close the job.');
            }
        }
    };
    
    // Step 11: Add a loading indicator for a better user experience
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-center p-10">
                <Header userType="company" />
                <h1 className="text-xl font-semibold text-primary">Loading Your Job Postings...</h1>
            </div>
        );
    }

    return ( 
        <div className="min-h-screen bg-background">
            <Header userType="company" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-text-primary mb-8">My Job Postings</h1>
                <div className="bg-surface rounded-lg shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            {/* Table Head remains the same */}
                            <thead className="bg-gray-50 border-b-2 border-gray-200"><tr><th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase">Job Title</th><th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase">Applicants</th><th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase">Status</th><th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase">Actions</th></tr></thead>
                            
                            {/* Table Body now uses data from the state */}
                            <tbody className="divide-y divide-gray-200">
                                {myJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-text-secondary">
                                            No job postings found. <Link to="/company/post-job" className="text-primary hover:underline">Post your first job</Link>
                                        </td>
                                    </tr>
                                ) : (
                                    myJobs.map((job) => (
                                        // Use job._id because MongoDB uses _id as the primary key
                                        <tr key={job._id}>
                                            <td className="px-6 py-4 font-medium text-text-primary">{job.title}</td>
                                            <td className="px-6 py-4 text-center text-text-primary font-semibold">{job.applicants || 0}</td>
                                            <td className="px-6 py-4 text-center"><StatusBadge status={job.status || 'Live'} /></td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-4">
                                                    <Link to={`/company/applicants?jobId=${job._id}&jobTitle=${encodeURIComponent(job.title)}`} className="text-info hover:text-opacity-80" title="View Applicants"><EyeIcon className="h-5 w-5"/></Link>
                                                    <Link to={`/company/edit-job/${job._id}`} className="text-warning hover:text-opacity-80" title="Edit Job"><PencilIcon className="h-5 w-5"/></Link>
                                                    <button onClick={() => handleCloseJob(job._id, job.title)} className="text-danger hover:text-opacity-80" title="Close Job" disabled={job.status === 'Closed'}><TrashIcon className="h-5 w-5"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyPostingsPage;