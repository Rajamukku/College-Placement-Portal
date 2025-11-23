// client/src/pages/company/EditJobPage.js

import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios'; // 1. Import axios

const EditJobPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [jobDetails, setJobDetails] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token');
                // Note: There isn't a dedicated "get single job" route in your backend yet.
                // We will fetch all postings and find the one we need. 
                // A better approach would be to add a GET /api/jobs/:id route.
                const res = await axios.get('http://localhost:5000/api/jobs/my-postings', {
                    headers: { 'x-auth-token': token }
                });
                
                const jobToEdit = res.data.find(job => job._id === jobId);

                if (jobToEdit) {
                    // Convert deadline to YYYY-MM-DD format for the input field
                    if (jobToEdit.deadline) {
                        jobToEdit.deadline = new Date(jobToEdit.deadline).toISOString().split('T')[0];
                    }
                    setJobDetails(jobToEdit);
                } else {
                    toast.error("Job not found!");
                    navigate('/company/postings');
                }
            } catch (err) {
                toast.error("Failed to fetch job details.");
                navigate('/company/postings');
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId, navigate]);

    const handleInputChange = (e) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Updating job...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            
            // The skills from the input will be a string, convert back to array if needed by backend
            const updateData = { ...jobDetails };
            if (typeof updateData.skills === 'string') {
                updateData.skills = updateData.skills.split(',').map(s => s.trim());
            }

            await axios.put(`http://localhost:5000/api/jobs/${jobId}`, updateData, config);
            
            toast.dismiss(loadingToast);
            toast.success('Job details updated successfully!');
            navigate('/company/postings');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.msg || 'Failed to update job.');
        }
    };
    
    // The rest of the component (loading state and JSX) remains the same
    if (!jobDetails) return <div className="text-center p-10">Loading job details...</div>;

    return (
        <div className="min-h-screen bg-background">
            <Header userType="company" />
            <main className="max-w-4xl mx-auto py-10 px-4">
                <Link to="/company/postings" className="flex items-center gap-2 text-primary font-semibold hover:underline mb-6">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Back to My Postings
                </Link>
                <h1 className="text-3xl font-bold text-text-primary mb-8">Edit Job Posting</h1>
                <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-card space-y-6">
                    {/* Form fields remain the same */}
                    <div><label htmlFor="title" className="block text-sm font-medium text-text-secondary">Job Title</label><input type="text" name="title" id="title" value={jobDetails.title} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-text-secondary">Job Description</label><textarea name="description" id="description" rows="5" value={jobDetails.description} onChange={handleInputChange} className="mt-1 w-full form-textarea rounded-md" required></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="package" className="block text-sm font-medium text-text-secondary">Package / Salary</label><input type="text" name="package" id="package" value={jobDetails.package} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                        <div><label htmlFor="eligibility" className="block text-sm font-medium text-text-secondary">Eligibility Criteria</label><input type="text" name="eligibility" id="eligibility" value={jobDetails.eligibility} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    </div>
                    <div><label htmlFor="skills" className="block text-sm font-medium text-text-secondary">Skills Required (comma-separated)</label><input type="text" name="skills" id="skills" value={Array.isArray(jobDetails.skills) ? jobDetails.skills.join(', ') : jobDetails.skills} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    <div><label htmlFor="deadline" className="block text-sm font-medium text-text-secondary">Application Deadline</label><input type="date" name="deadline" id="deadline" value={jobDetails.deadline} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    <div className="pt-4 text-right"><button type="submit" className="px-8 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">Save Changes</button></div>
                </form>
            </main>
        </div>
    );
};

export default EditJobPage;