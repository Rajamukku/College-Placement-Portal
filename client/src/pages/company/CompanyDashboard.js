import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { Link } from 'react-router-dom';
import { 
    BriefcaseIcon, 
    UserGroupIcon, 
    CheckBadgeIcon, 
    PlusCircleIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    ChartBarIcon,
    BellAlertIcon,
    SparklesIcon,
    EyeIcon,
    PencilSquareIcon,
    CalendarDaysIcon,
    FireIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const CompanyDashboard = () => {
    const [companyName, setCompanyName] = useState('Company');
    const [stats, setStats] = useState({ 
        activeJobs: 0, 
        totalApplicants: 0, 
        hired: 0,
        pipeline: { applied: 0, shortlisted: 0, interview: 0, hired: 0 }
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentApplicants, setRecentApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    setIsLoading(false);
                    return;
                }
                const config = { headers: { 'x-auth-token': token } };
                const [meRes, summaryRes, jobsRes, applicantsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/companies/me', config).catch(err => {
                        console.error('Error fetching company profile:', err);
                        return { data: { success: false } };
                    }),
                    axios.get('http://localhost:5000/api/jobs/summary', config).catch(err => {
                        console.error('Error fetching summary:', err);
                        return { data: {} };
                    }),
                    axios.get('http://localhost:5000/api/jobs/my-postings', config).catch(err => {
                        console.error('Error fetching jobs:', err);
                        return { data: [] };
                    }),
                    axios.get('http://localhost:5000/api/jobs/applicants', config).catch(err => {
                        console.error('Error fetching applicants:', err);
                        return { data: [] };
                    })
                ]);
                
                if (meRes.data?.success) {
                    setCompanyName(meRes.data.data?.name || 'Company');
                }
                
                const s = summaryRes.data || {};
                const pipelineData = s.pipeline || {};
                setStats({ 
                    activeJobs: s.activeJobs || 0, 
                    totalApplicants: s.totalApplications || 0, 
                    hired: s.hires || 0,
                    pipeline: {
                        applied: pipelineData.applied || 0,
                        shortlisted: pipelineData.shortlisted || 0,
                        interview: pipelineData.interview || 0,
                        hired: pipelineData.hired || 0
                    }
                });
                
                // Get recent 3 jobs
                const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
                setRecentJobs(jobs.slice(0, 3));
                
                // Get recent 5 applicants (sorted by date if available)
                const applicants = Array.isArray(applicantsRes.data) ? applicantsRes.data : [];
                setRecentApplicants(applicants.slice(0, 5));
                
            } catch (e) {
                console.error('Dashboard load error:', e);
                toast.error(e.response?.data?.msg || 'Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const pipeline = stats.pipeline || { applied: stats.totalApplicants, shortlisted: 0, interview: 0, hired: stats.hired };
    const conversionRate = stats.totalApplicants > 0 ? ((stats.hired / stats.totalApplicants) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header userType="company" />
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        Welcome, {companyName}!
                    </h1>
                    <p className="text-lg text-text-secondary">Here's what's happening with your recruitment</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Active Jobs" value={stats.activeJobs} Icon={BriefcaseIcon} />
                    <StatCard title="Total Applicants" value={stats.totalApplicants} Icon={UserGroupIcon} />
                    <StatCard title="Total Hires" value={stats.hired} Icon={CheckBadgeIcon} />
                    <div className="bg-gradient-to-br from-secondary to-orange-500 p-6 rounded-xl shadow-lg flex items-center space-x-4 text-white hover:shadow-xl transition-all transform hover:scale-105">
                        <div className="bg-white/20 p-3 rounded-full">
                            <PlusCircleIcon className="h-8 w-8 text-white" />
                        </div>
                        <Link to="/company/post-job" className="flex-1">
                            <p className="text-xl font-bold">Post a New Job</p>
                            <p className="text-sm opacity-90">Get started in seconds</p>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Hiring Pipeline - Enhanced */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                                <ChartBarIcon className="h-6 w-6" />
                                Hiring Pipeline
                            </h2>
                            <span className="text-sm text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                                    {conversionRate}% conversion rate
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500 transform hover:scale-105 transition-transform">
                                <p className="text-4xl font-bold text-blue-600 mb-2">{pipeline.applied}</p>
                                <p className="text-sm font-semibold text-blue-800">Applied</p>
                                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mt-2" />
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border-l-4 border-yellow-500 transform hover:scale-105 transition-transform">
                                <p className="text-4xl font-bold text-yellow-600 mb-2">{pipeline.shortlisted}</p>
                                <p className="text-sm font-semibold text-yellow-800">Shortlisted</p>
                                <SparklesIcon className="h-5 w-5 text-yellow-500 mt-2" />
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500 transform hover:scale-105 transition-transform">
                                <p className="text-4xl font-bold text-purple-600 mb-2">{pipeline.interview}</p>
                                <p className="text-sm font-semibold text-purple-800">Interview</p>
                                <ClockIcon className="h-5 w-5 text-purple-500 mt-2" />
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500 transform hover:scale-105 transition-transform">
                                <p className="text-4xl font-bold text-green-600 mb-2">{pipeline.hired}</p>
                                <p className="text-sm font-semibold text-green-800">Hired</p>
                                <CheckBadgeIcon className="h-5 w-5 text-green-500 mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <Link 
                                to="/company/post-job" 
                                className="block p-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                            >
                                <PlusCircleIcon className="h-5 w-5 inline mr-2" />
                                Post New Job
                            </Link>
                            <Link 
                                to="/company/applicants" 
                                className="block p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                            >
                                <EyeIcon className="h-5 w-5 inline mr-2" />
                                View All Applicants
                            </Link>
                            <Link 
                                to="/company/postings" 
                                className="block p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all border border-green-200"
                            >
                                <PencilSquareIcon className="h-5 w-5 inline mr-2" />
                                Manage Jobs
                            </Link>
                            <Link 
                                to="/company/analytics" 
                                className="block p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all border border-purple-200"
                            >
                                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                                View Analytics
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Notifications & Alerts */}
                <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BellAlertIcon className="h-6 w-6 text-yellow-600" />
                            <div>
                                <h3 className="font-bold text-primary">Quick Alerts</h3>
                                <p className="text-sm text-text-secondary">
                                    {pipeline.shortlisted > 0 && `${pipeline.shortlisted} candidate(s) need interview scheduling`}
                                    {pipeline.shortlisted === 0 && pipeline.applied > 0 && `${pipeline.applied} new application(s) to review`}
                                    {pipeline.applied === 0 && pipeline.shortlisted === 0 && 'All caught up! No pending actions.'}
                                </p>
                            </div>
                        </div>
                        {pipeline.shortlisted > 0 && (
                            <Link 
                                to="/company/pipeline"
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all text-sm font-medium"
                            >
                                Review Pipeline
                            </Link>
                        )}
                    </div>
                </div>

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Job Postings */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                <BriefcaseIcon className="h-5 w-5" />
                                Recent Job Postings
                            </h2>
                            <Link to="/company/postings" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View All <ArrowTrendingUpIcon className="h-4 w-4" />
                            </Link>
                        </div>
                        {recentJobs.length > 0 ? (
                            <div className="space-y-3">
                                {recentJobs.map((job) => (
                                    <Link
                                        key={job._id}
                                        to={`/company/applicants?jobId=${job._id}&jobTitle=${encodeURIComponent(job.title)}`}
                                        className="block p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200 hover:border-blue-300 cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{job.title}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-sm text-text-secondary flex items-center gap-1">
                                                        <UserGroupIcon className="h-4 w-4" />
                                                        {job.applicants || 0} applicants
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        job.status === 'Live' ? 'bg-green-100 text-green-800 border border-green-300' :
                                                        'bg-gray-100 text-gray-800 border border-gray-300'
                                                    }`}>
                                                        {job.status || 'Live'}
                                                    </span>
                                                </div>
                                                {job.deadline && (
                                                    <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                                                        <CalendarDaysIcon className="h-3 w-3" />
                                                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <EyeIcon className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-text-secondary py-8">No job postings yet</p>
                        )}
                    </div>

                    {/* Recent Applicants */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                <UserGroupIcon className="h-5 w-5" />
                                Recent Applicants
                            </h2>
                            <Link to="/company/applicants" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View All <ArrowTrendingUpIcon className="h-4 w-4" />
                            </Link>
                        </div>
                        {recentApplicants.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {recentApplicants.map((applicant, idx) => (
                                    <Link
                                        key={`${applicant._id}-${idx}`}
                                        to={`/company/applicants${applicant.jobId ? `?jobId=${applicant.jobId}` : ''}`}
                                        className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200 hover:border-blue-300 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-text-primary">{applicant.name}</h3>
                                                    {applicant.status === 'shortlisted' && (
                                                        <SparklesIcon className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                    {applicant.status === 'hired' && (
                                                        <CheckBadgeIcon className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-secondary mt-1">
                                                    {applicant.jobTitle || 'Position'} • {applicant.studentId || 'ID: N/A'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        applicant.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                                        applicant.status === 'interview' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                                                        applicant.status === 'hired' ? 'bg-green-100 text-green-800 border border-green-300' :
                                                        'bg-blue-100 text-blue-800 border border-blue-300'
                                                    }`}>
                                                        {applicant.status || 'applied'}
                                                    </span>
                                                    {applicant.matchScore && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                                                            {applicant.matchScore}% match
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowTrendingUpIcon className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-text-secondary">No applicants yet</p>
                                <p className="text-sm text-text-secondary mt-1">Start posting jobs to see applications</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Insights */}
                {stats.totalApplicants > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    <ChartBarIcon className="h-6 w-6" />
                                    Performance Insights
                                </h3>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <p className="text-sm opacity-90">Conversion Rate</p>
                                        <p className="text-3xl font-bold">{conversionRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90">Avg. Applicants/Job</p>
                                        <p className="text-3xl font-bold">
                                            {stats.activeJobs > 0 ? Math.round(stats.totalApplicants / stats.activeJobs) : 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90">Interview Success</p>
                                        <p className="text-3xl font-bold">
                                            {pipeline.interview > 0 ? Math.round((stats.hired / pipeline.interview) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Link 
                                to="/company/analytics"
                                className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-lg"
                            >
                                View Analytics →
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CompanyDashboard;
