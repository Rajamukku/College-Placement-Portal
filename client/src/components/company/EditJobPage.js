import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// In a real app, you would fetch this data. We'll simulate it.
const findJobById = (id) => {
    const jobs = [
        { id: 1, title: 'Frontend Developer', applicants: 125, status: 'Live', description: 'Build beautiful UIs.', package: '14 LPA', eligibility: 'CPI > 7.0', skills: 'React, JS', deadline: '2023-12-15' },
        { id: 2, title: 'UX Designer', applicants: 45, status: 'Live', description: 'Design user-centric flows.', package: '12 LPA', eligibility: 'Any Branch', skills: 'Figma, UI', deadline: '2023-12-10' },
    ];
    return jobs.find(job => job.id.toString() === id);
};

const EditJobPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [jobDetails, setJobDetails] = useState(null);

    useEffect(() => {
        const jobToEdit = findJobById(jobId);
        if (jobToEdit) {
            setJobDetails(jobToEdit);
        } else {
            toast.error("Job not found!");
            navigate('/company/postings');
        }
    }, [jobId, navigate]);

    const handleInputChange = (e) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here, you would send the updated jobDetails to your backend API.
        console.log("Updating job:", jobDetails);
        toast.success('Job details updated successfully!');
        navigate('/company/postings');
    };

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
                    <div><label htmlFor="title" className="block text-sm font-medium text-text-secondary">Job Title</label><input type="text" name="title" id="title" value={jobDetails.title} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-text-secondary">Job Description</label><textarea name="description" id="description" rows="5" value={jobDetails.description} onChange={handleInputChange} className="mt-1 w-full form-textarea rounded-md" required></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="package" className="block text-sm font-medium text-text-secondary">Package / Salary</label><input type="text" name="package" id="package" value={jobDetails.package} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                        <div><label htmlFor="eligibility" className="block text-sm font-medium text-text-secondary">Eligibility Criteria</label><input type="text" name="eligibility" id="eligibility" value={jobDetails.eligibility} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    </div>
                    <div><label htmlFor="skills" className="block text-sm font-medium text-text-secondary">Skills Required (comma-separated)</label><input type="text" name="skills" id="skills" value={jobDetails.skills} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    <div><label htmlFor="deadline" className="block text-sm font-medium text-text-secondary">Application Deadline</label><input type="date" name="deadline" id="deadline" value={jobDetails.deadline} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required /></div>
                    <div className="pt-4 text-right"><button type="submit" className="px-8 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">Save Changes</button></div>
                </form>
            </main>
        </div>
    );
};

export default EditJobPage;