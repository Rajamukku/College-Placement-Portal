import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { BriefcaseIcon, UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const emptyFunnel = {
    labels: ['Applied', 'Shortlisted', 'Interview', 'On Hold', 'Hired'],
    datasets: [{
        label: 'Number of Candidates',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
    }],
};

const hiresByRoleData = {
    labels: ['Frontend Developer', 'Backend Engineer', 'Data Analyst'],
    datasets: [{
        label: 'Hires This Season',
        data: [2, 2, 1],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
    }],
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' },
        title: { display: true, font: { size: 16 } },
    },
};

const AnalyticsDashboardPage = () => {
    const [stats, setStats] = useState({ activeJobs: 0, totalApplications: 0, hires: 0 });
    const [funnel, setFunnel] = useState(emptyFunnel);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    return;
                }
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/jobs/summary', config).catch(err => {
                    console.error('Error fetching analytics:', err);
                    return { data: {} };
                });
                const s = res.data || {};
                setStats({ 
                    activeJobs: s.activeJobs || 0, 
                    totalApplications: s.totalApplications || 0, 
                    hires: s.hires || 0 
                });
                const p = s.pipeline || {};
                setFunnel({
                    ...emptyFunnel,
                    datasets: [{ ...emptyFunnel.datasets[0], data: [p.applied || 0, p.shortlisted || 0, p.interview || 0, p.hold || 0, p.hired || 0] }]
                });
            } catch (e) {
                console.error('Analytics load error:', e);
                toast.error(e.response?.data?.msg || 'Failed to load analytics');
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header userType="company" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-text-primary mb-8">Analytics Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard title="Active Jobs" value={stats.activeJobs} Icon={BriefcaseIcon} />
                    <StatCard title="Total Applications" value={stats.totalApplications} Icon={UserGroupIcon} />
                    <StatCard title="Total Hires" value={stats.hires} Icon={CheckBadgeIcon} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-surface p-6 rounded-lg shadow-card">
                         <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Hiring Funnel Overview'}}}} data={funnel} />
                    </div>
                     <div className="bg-surface p-6 rounded-lg shadow-card">
                         <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Hires by Job Role'}}}} data={hiresByRoleData} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboardPage;