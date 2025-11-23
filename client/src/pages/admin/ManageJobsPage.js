import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import axios from 'axios';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const styles = {
        'Live': 'bg-success/10 text-success',
        'Pending Approval': 'bg-warning/10 text-warning',
        'Closed': 'bg-danger/10 text-danger',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

const ManageJobsPage = () => {
    const [allJobs, setAllJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllJobs = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/admin/jobs', config);
                setAllJobs(res.data);
            } catch (err) {
                toast.error("Could not fetch job postings.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllJobs();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Job Postings Overview</h1>
                <p className="text-text-secondary mb-8">A read-only view of all jobs posted by companies on the portal.</p>

                <div className="bg-surface rounded-lg shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase">Job Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase">Company</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase">Applicants</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-secondary uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-secondary uppercase">Deadline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="text-center py-10">Loading jobs...</td></tr>
                                ) : allJobs.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-text-secondary">No jobs found</td></tr>
                                ) : allJobs.map((job) => (
                                    <tr key={job._id}>
                                        <td className="px-6 py-4 font-medium text-text-primary">{job.title || 'N/A'}</td>
                                        <td className="px-6 py-4 text-text-secondary">{job.company?.name || 'Unknown Company'}</td>
                                        <td className="px-6 py-4 text-center text-text-primary font-semibold">{job.applicants || 0}</td>
                                        <td className="px-6 py-4 text-center"><StatusBadge status={job.status || 'Live'} /></td>
                                        <td className="px-6 py-4 text-text-secondary">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManageJobsPage;