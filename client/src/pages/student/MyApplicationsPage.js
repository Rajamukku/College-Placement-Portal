import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import { DocumentCheckIcon, UserGroupIcon, CalendarDaysIcon, HandThumbUpIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

// Enhanced Mock Data for a richer experience
const useApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchApps = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/applications', config);
                // Normalize response to expected shape
                const apps = (Array.isArray(res.data) ? res.data : []).map(a => ({
                    id: a._id,
                    company: a.companyName || a.company?.name || 'Company',
                    role: a.jobTitle || a.job?.title || 'Role',
                    status: a.status || 'applied',
                    date: new Date(a.createdAt || a.date || Date.now()).toISOString().slice(0,10),
                    nextStep: a.nextStep || 'Your application is under review.'
                }));
                setApplications(apps);
            } catch (e) {
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);
    return { applications, loading };
};

// Configuration object to manage styles and icons for each status
const statusConfig = {
    applied: { icon: DocumentCheckIcon, color: 'text-info', bgColor: 'bg-info/10', borderColor: 'border-info' },
    shortlisted: { icon: UserGroupIcon, color: 'text-warning', bgColor: 'bg-warning/10', borderColor: 'border-warning' },
    interview: { icon: CalendarDaysIcon, color: 'text-accent', bgColor: 'bg-accent/10', borderColor: 'border-accent' },
    offered: { icon: HandThumbUpIcon, color: 'text-success', bgColor: 'bg-success/10', borderColor: 'border-success' },
    rejected: { icon: XCircleIcon, color: 'text-danger', bgColor: 'bg-danger/10', borderColor: 'border-danger' },
};

// Reusable component for displaying each application card
const ApplicationCard = ({ app }) => {
    // Default to 'applied' status if an unknown status is received
    const { icon: Icon, color, bgColor, borderColor } = statusConfig[app.status] || statusConfig.applied;
    
    return (
        <div className={`bg-surface rounded-lg shadow-card p-5 flex items-start gap-4 border-l-4 ${borderColor}`}>
            <div className={`p-3 rounded-full ${bgColor} flex-shrink-0`}>
                <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <div className="flex-1">
                <p className="font-bold text-lg text-primary">{app.role}</p>
                <p className="text-md text-text-secondary">{app.company}</p>
                <div className={`mt-3 inline-block px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${color}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </div>
                <p className="text-sm text-text-secondary mt-2 pt-2 border-t border-gray-200">
                    <span className="font-semibold">Next Step:</span> {app.nextStep}
                </p>
            </div>
            <p className="text-xs text-text-secondary flex-shrink-0 whitespace-nowrap">Applied: {app.date}</p>
        </div>
    );
};

// --- Main MyApplicationsPage Component ---

const MyApplicationsPage = () => {
    const { applications, loading } = useApplications();
    return (
        <div className="min-h-screen bg-background">
            <Header userType="student" />
            <main className="max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-text-primary mb-2">My Application Tracker</h1>
                <p className="text-md text-text-secondary mb-8">Follow the journey of your placement applications from start to finish.</p>
                
                {loading ? (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-card">Loading applications...</div>
                ) : applications.length > 0 ? (
                    <div className="space-y-6">
                        {applications.map((app) => (
                            <ApplicationCard key={app.id} app={app} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-surface rounded-lg shadow-card">
                        <h2 className="text-xl font-semibold text-primary">No Applications Yet!</h2>
                        <p className="text-text-secondary mt-2">Start applying for jobs to see your progress here.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyApplicationsPage;