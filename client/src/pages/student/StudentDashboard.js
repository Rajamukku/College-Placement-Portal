import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
    BriefcaseIcon, 
    DocumentTextIcon, 
    UserCircleIcon, 
    ChartBarIcon, 
    BellAlertIcon,
    ClockIcon,
    CheckCircleIcon,
    FireIcon,
    AcademicCapIcon,
    TrophyIcon,
    SparklesIcon,
    ArrowRightIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/common/Header';

// --- Reusable Components within this file ---

// Profile Completion Widget
const ProfileCompletion = ({ percentage }) => (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-6 rounded-xl shadow-lg border-2 border-orange-200 col-span-1 md:col-span-4 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-3 rounded-full">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-primary text-lg">Profile Completeness</h3>
                    <p className="text-xs text-text-secondary">Increase your chances of getting noticed</p>
                </div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
                className="bg-gradient-to-r from-orange-400 via-yellow-400 to-secondary h-3 rounded-full transition-all duration-700 shadow-md" 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        {percentage < 100 ? (
            <Link 
                to="/student/profile" 
                className="inline-flex items-center gap-2 text-sm text-orange-700 hover:text-orange-800 font-medium bg-orange-100 px-4 py-2 rounded-lg hover:bg-orange-200 transition-all"
            >
                Complete your profile <ArrowRightIcon className="h-4 w-4" />
            </Link>
        ) : (
            <div className="flex items-center gap-2 text-green-700">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Profile complete! 🎉</span>
            </div>
        )}
    </div>
);

// Dashboard Navigation Cards
const DashboardCard = ({ to, Icon, title, description, isHighlighted = false, color = 'text-secondary' }) => (
  <Link to={to} className={`group relative overflow-hidden block p-6 bg-surface rounded-lg shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ${isHighlighted && 'bg-primary text-white'}`}>
    <Icon className={`h-10 w-10 mb-4 transition-colors ${isHighlighted ? 'text-white' : color}`}/>
    <h3 className={`text-xl font-semibold transition-colors ${isHighlighted ? 'text-white' : 'text-text-primary'}`}>{title}</h3>
    <p className={`mt-1 text-sm ${isHighlighted ? 'text-gray-200' : 'text-text-secondary'}`}>{description}</p>
    <span className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-2xl font-bold ${isHighlighted ? 'text-white' : color}`}>&rarr;</span>
  </Link>
);

// --- Mock Data (to be replaced by API calls) ---

// Mock Announcements from the Placement Office
const announcements = [
    { id: 1, text: 'Mega Recruitment Drive by Tech Innovators Inc. next week. Be prepared!', date: 'Nov 5, 2023' },
    { id: 2, text: 'Pre-placement talk by Microsoft scheduled for this Friday. Attendance is mandatory.', date: 'Nov 1, 2023' },
    { id: 3, text: 'All students must upload their updated resume to the portal by EOD.', date: 'Oct 30, 2023' },
];

// --- Main StudentDashboard Component ---

// Stat Card Component
const StatCard = ({ Icon, value, label, color, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient || 'from-white to-gray-50'} p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:scale-105`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                <p className={`text-3xl font-bold ${color || 'text-primary'}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-opacity-20 ${color || 'bg-primary'}`}>
                <Icon className={`h-8 w-8 ${color || 'text-primary'}`} />
            </div>
        </div>
    </div>
);

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('Student');
  const [profileProgress, setProfileProgress] = useState(0);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    hired: 0,
    rejected: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to continue');
          setIsLoading(false);
          return;
        }
        
        const config = { headers: { 'x-auth-token': token } };
        
        // Fetch student profile
        const profileRes = await axios.get('http://localhost:5000/api/students/me', config).catch(() => ({ data: {} }));
        
        if (profileRes.data?.success && profileRes.data.student) {
          setStudentName(profileRes.data.student.name || 'Student');
          const s = profileRes.data.student;
          const fields = [s.name, s.branch, s.phone, s.resumeLink, s.academics?.cpi, s.skills?.length];
          const filled = fields.filter(Boolean).length;
          setProfileProgress(Math.min(100, Math.round((filled / fields.length) * 100)) || 0);
        }

        // Fetch applications for stats
        const appsRes = await axios.get('http://localhost:5000/api/applications', config).catch(() => ({ data: [] }));
        const apps = Array.isArray(appsRes.data) ? appsRes.data : [];
        const stats = {
          total: apps.length,
          pending: apps.filter(a => a.status === 'applied' || a.status === 'shortlisted' || a.status === 'interview').length,
          shortlisted: apps.filter(a => a.status === 'shortlisted').length,
          hired: apps.filter(a => a.status === 'hired').length,
          rejected: apps.filter(a => a.status === 'rejected').length
        };
        setApplicationStats(stats);

        // Fetch recent jobs
        const jobsRes = await axios.get('http://localhost:5000/api/student/jobs', config).catch(() => ({ data: [] }));
        const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        setRecentJobs(jobs.slice(0, 4));

        // Get upcoming deadlines (jobs with deadlines in next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = jobs.filter(job => {
          if (!job.deadline) return false;
          const deadline = new Date(job.deadline);
          return deadline >= today && deadline <= nextWeek && job.status === 'Live';
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3);
        setUpcomingDeadlines(upcoming);

      } catch (err) {
        console.error('Dashboard error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      <Header userType="student" />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header with Gradient */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-2">
            Welcome, {studentName}! 👋
          </h1>
          <p className="text-lg text-text-secondary">Your placement journey starts here. Let's get you hired!</p>
        </div>

        {/* Application Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard 
            Icon={BriefcaseIcon} 
            value={applicationStats.total} 
            label="Total Applications" 
            color="text-blue-600"
            gradient="from-blue-50 to-blue-100"
          />
          <StatCard 
            Icon={ClockIcon} 
            value={applicationStats.pending} 
            label="Pending" 
            color="text-yellow-600"
            gradient="from-yellow-50 to-yellow-100"
          />
          <StatCard 
            Icon={SparklesIcon} 
            value={applicationStats.shortlisted} 
            label="Shortlisted" 
            color="text-purple-600"
            gradient="from-purple-50 to-purple-100"
          />
          <StatCard 
            Icon={CheckCircleIcon} 
            value={applicationStats.hired} 
            label="Hired" 
            color="text-green-600"
            gradient="from-green-50 to-green-100"
          />
          <StatCard 
            Icon={TrophyIcon} 
            value={profileProgress} 
            label="Profile Complete" 
            color="text-orange-600"
            gradient="from-orange-50 to-orange-100"
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ProfileCompletion percentage={profileProgress} />
            <DashboardCard to="/student/jobs" Icon={BriefcaseIcon} title="Browse Jobs" description="Find your dream company" color="text-info" />
            <DashboardCard to="/student/applications" Icon={ChartBarIcon} title="My Applications" description="Track your application status" color="text-success" />
            <DashboardCard to="/student/profile" Icon={UserCircleIcon} title="My Profile" description="Keep your details updated" color="text-warning" />
        </div>

        {/* AI Resume Builder Highlight */}
        <div className="mb-8">
          <Link to="/student/ai-resume" className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <SparklesIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">AI Resume Builder</h3>
                  <p className="text-white/90">Create a professional, ATS-friendly resume in minutes</p>
                </div>
              </div>
              <ArrowRightIcon className="h-8 w-8 text-white" />
            </div>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Featured Jobs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <FireIcon className="h-6 w-6 text-orange-500" />
                Featured Opportunities
              </h2>
              <Link to="/student/jobs" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link 
                    key={job._id} 
                    to={`/student/jobs`}
                    className="block p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all border border-blue-200 hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-text-primary">{job.title}</h3>
                        <p className="text-sm text-text-secondary mt-1">{job.company?.name || 'Company'}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                          {job.package && <span className="text-green-600 font-medium">💰 {job.package}</span>}
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-secondary py-8">No jobs available at the moment</p>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-warning" />
                Upcoming Deadlines
              </h2>
              {upcomingDeadlines.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                  {upcomingDeadlines.length} due soon
                </span>
              )}
            </div>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((job) => {
                  const deadline = new Date(job.deadline);
                  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div 
                      key={job._id} 
                      className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-text-primary">{job.title}</h3>
                          <p className="text-sm text-text-secondary mt-1">{job.company?.name || 'Company'}</p>
                          <p className={`text-xs font-medium mt-2 ${daysLeft <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                            ⏰ {daysLeft === 0 ? 'Due today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                          </p>
                        </div>
                        <Link 
                          to={`/student/jobs`}
                          className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-opacity-90 transition-all"
                        >
                          Apply
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-text-secondary">No upcoming deadlines</p>
                <p className="text-sm text-text-secondary mt-1">You're all caught up! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
                <BellAlertIcon className="h-7 w-7 mr-3 text-secondary"/>
                Important Announcements
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 space-y-4 border border-blue-100">
                {announcements.length > 0 ? (
                    announcements.map(ann => (
                        <div key={ann.id} className="border-l-4 border-secondary pl-4 py-3 bg-white rounded-r-lg shadow-sm hover:shadow-md transition-all">
                            <p className="font-semibold text-primary flex items-start gap-2">
                              <FireIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                              {ann.text}
                            </p>
                            <p className="text-xs text-text-secondary mt-1 ml-7">{ann.date}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-text-secondary py-4">No new announcements at this time.</p>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;