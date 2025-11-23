// src/pages/admin/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { 
    UsersIcon, 
    BuildingOffice2Icon, 
    CheckCircleIcon, 
    DocumentMagnifyingGlassIcon, 
    BriefcaseIcon, 
    UserPlusIcon, 
    BellAlertIcon 
} from '@heroicons/react/24/outline';

// Mock data for the activity feed
const recentActivities = [
    { type: 'application', text: 'Priya Sharma applied for Frontend Developer at Google.', icon: BriefcaseIcon, time: '2m ago' },
    { type: 'student', text: 'Rohan Verma updated his profile.', icon: UserPlusIcon, time: '15m ago' },
    { type: 'company', text: 'Microsoft posted a new job: Backend Engineer.', icon: BellAlertIcon, time: '1h ago' },
];

const AdminDashboard = () => {
    // State for dynamic stats
    const [stats, setStats] = useState({ totalStudents: 0, totalCompanies: 0, applications: 0, placements: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch stats from the backend when the component loads
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error("Authentication required.");
                    setIsLoading(false);
                    return;
                }
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/admin/stats', config);
                setStats(res.data);
            } catch (error) {
                toast.error("Could not load dashboard stats.");
                console.error("Dashboard Stats Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []); // Empty dependency array means this runs once on mount

    // Helper to show '...' while loading
    const displayStat = (value) => isLoading ? '...' : value;

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>

                {/* Stats Grid - Now uses dynamic data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Students" value={displayStat(stats.totalStudents)} Icon={UsersIcon} />
                    <StatCard title="Companies Onboard" value={displayStat(stats.totalCompanies)} Icon={BuildingOffice2Icon} />
                    <StatCard title="Total Applications" value={displayStat(stats.applications)} Icon={DocumentMagnifyingGlassIcon} />
                    <StatCard title="Students Placed" value={displayStat(stats.placements)} Icon={CheckCircleIcon} />
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1 bg-surface p-6 rounded-lg shadow-card">
                        <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <ActionLink to="/admin/students">Manage Students</ActionLink>
                            <ActionLink to="/admin/companies">Manage Companies</ActionLink>
                            <ActionLink to="/admin/jobs">View All Job Postings</ActionLink>
                            <ActionLink to="/admin/announcements">Post an Announcement</ActionLink>
                            <ActionLink to="/admin/reports">Generate Reports</ActionLink>
                            <ActionLink to="/admin/security">Security Settings</ActionLink>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-card">
                         <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
                         <ul className="divide-y divide-gray-200">
                             {recentActivities.map((activity, index) => (
                                 <li key={index} className="py-3 flex items-start">
                                     <div className="bg-pu-light-blue p-2 rounded-full mr-4">
                                        <activity.icon className="h-6 w-6 text-primary" />
                                     </div>
                                     <div className="flex-1">
                                        <p className="text-sm text-text-primary">{activity.text}</p>
                                        <p className="text-xs text-text-secondary mt-1">{activity.time}</p>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Reusable ActionLink component
const ActionLink = ({ to, children }) => (
    <Link to={to} className="block w-full text-left p-3 bg-gray-50 rounded-md text-primary font-semibold hover:bg-accent hover:text-white transition-colors">
        {children} &rarr;
    </Link>
);

export default AdminDashboard;