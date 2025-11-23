// client/src/pages/company/PostJobPage.js

import React from 'react';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Import axios

const PostJobPage = () => {
    const navigate = useNavigate();

    // 2. Replace the old handleSubmit with an async API call
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newJobData = Object.fromEntries(formData.entries());
        // Server expects skills as a comma-separated string per model
        if (Array.isArray(newJobData.skills)) {
            newJobData.skills = newJobData.skills.join(',');
        }

        const loadingToast = toast.loading('Posting new job...');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication required.');
                return;
            }

            const config = {
                headers: { 'x-auth-token': token }
            };

            await axios.post('http://localhost:5000/api/jobs', newJobData, config);

            toast.dismiss(loadingToast);
            toast.success('Job posted successfully!');
            navigate('/company/postings');

        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.msg || 'Failed to post job.');
            console.error('Job Posting Error:', err);
        }
    };
    
    // The JSX for the form remains the same
    return (
        <div className="min-h-screen bg-background">
            <Header userType="company" />
            <main className="max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Post a New Job</h1>
                <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-card space-y-6">
                    <div><label htmlFor="title" className="block text-sm font-medium text-text-secondary">Job Title</label><input type="text" name="title" id="title" className="mt-1 w-full form-input rounded-md" required /></div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-text-secondary">Job Description</label><textarea name="description" id="description" rows="5" className="mt-1 w-full form-textarea rounded-md" required></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="package" className="block text-sm font-medium text-text-secondary">Package / Salary</label><input type="text" name="package" id="package" className="mt-1 w-full form-input rounded-md" required /></div>
                        <div><label htmlFor="eligibility" className="block text-sm font-medium text-text-secondary">Eligibility Criteria</label><input type="text" name="eligibility" id="eligibility" className="mt-1 w-full form-input rounded-md" required /></div>
                    </div>
                    <div><label htmlFor="skills" className="block text-sm font-medium text-text-secondary">Skills Required (comma-separated)</label><input type="text" name="skills" id="skills" className="mt-1 w-full form-input rounded-md" required /></div>
                    <div><label htmlFor="deadline" className="block text-sm font-medium text-text-secondary">Application Deadline</label><input type="date" name="deadline" id="deadline" className="mt-1 w-full form-input rounded-md" required /></div>
                    <div className="pt-4 text-right"><button type="submit" className="px-8 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">Post Job</button></div>
                </form>
            </main>
        </div>
    );
};

export default PostJobPage;