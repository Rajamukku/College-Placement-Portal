import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar'; // Import the new search component
import JobCard from '../../components/student/JobCard';
import SkeletonJobCard from '../../components/student/SkeletonJobCard';
import JobDetailModal from '../../components/student/JobDetailModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const BrowseJobs = () => {
    const [allJobs, setAllJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State to hold the search input value

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/student/jobs', config);
                const jobsWithAppliedStatus = (Array.isArray(res.data) ? res.data : []).map(job => ({ ...job, isApplied: false }));
                setAllJobs(jobsWithAppliedStatus);
            } catch (err) {
                toast.error("Could not fetch available jobs.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Memoized filtering logic. This recalculates the job list only when
    // the original job list or the search query changes.
    const filteredJobs = useMemo(() => {
        if (!searchQuery) {
            return allJobs; // If search is empty, return all jobs
        }
        return allJobs.filter(job => 
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (job.company && (job.company.name || job.company).toLowerCase().includes(searchQuery.toLowerCase())) ||
            (typeof job.skills === 'string' ? job.skills.toLowerCase() : Array.isArray(job.skills) ? job.skills.join(',').toLowerCase() : '').includes(searchQuery.toLowerCase())
        );
    }, [allJobs, searchQuery]);

    const handleCardClick = (job) => {
        setSelectedJob(job);
    };

    const handleApply = async (jobId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.post(`http://localhost:5000/api/student/jobs/${jobId}/apply`, {}, config);
            
            setAllJobs(currentJobs => 
                currentJobs.map(job => 
                    job._id === jobId ? { ...job, isApplied: true } : job
                )
            );
            toast.success("Applied successfully!");
            setSelectedJob(prev => ({...prev, isApplied: true}));
        } catch(err) {
            toast.error(err.response?.data?.msg || "Failed to apply.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="student" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-text-primary">Find Your Next Opportunity</h1>
                    <p className="mt-2 text-lg text-text-secondary">Explore all available job postings from top companies.</p>
                    
                    {/* Add the SearchBar component to the UI */}
                    <div className="mt-6 max-w-lg mx-auto">
                         <SearchBar 
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            placeholder="Search by title, company, or skill (e.g., React)..."
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => <SkeletonJobCard key={index} />)
                    ) : (
                        // Map over the 'filteredJobs' list instead of 'allJobs'
                        filteredJobs.map(job => (
                            <div key={job._id} onClick={() => handleCardClick(job)} className="cursor-pointer">
                                <JobCard job={job} />
                            </div>
                        ))
                    )}
                    
                    {/* Display a message if the search yields no results */}
                    {!isLoading && filteredJobs.length === 0 && (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-10 bg-surface rounded-lg">
                            <p className="text-lg font-semibold text-text-primary">No Jobs Found</p>
                            <p className="text-text-secondary mt-1">
                                {searchQuery ? `Your search for "${searchQuery}" did not match any job postings.` : 'There are currently no open positions.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <JobDetailModal 
                job={selectedJob} 
                onClose={() => setSelectedJob(null)} 
                onApply={handleApply} 
            />
        </div>
    );
};

export default BrowseJobs;