import React from 'react';
import Header from '../../components/common/Header';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import StatCard from '../../components/common/StatCard';
import { UsersIcon, CheckCircleIcon, BuildingOffice2Icon, BriefcaseIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const ReportsPage = () => {

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/reports/csv', {
                headers: { 'x-auth-token': token },
                responseType: 'blob'
            });
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `placement-report-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report downloaded');
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate report');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-text-primary">Placement Reports</h1>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">
                        <DocumentArrowDownIcon className="h-5 w-5" />
                        Download Full Report (CSV)
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Total Eligible Students" value="450" Icon={UsersIcon} />
                    <StatCard title="Total Placed" value="189" Icon={CheckCircleIcon} />
                    <StatCard title="Companies Participated" value="35" Icon={BuildingOffice2Icon} />
                    <StatCard title="Jobs Posted" value="78" Icon={BriefcaseIcon} />
                </div>

                <div className="bg-surface p-4 rounded-lg shadow-card mb-8">
                    <h3 className="font-bold text-primary mb-4">Filter Report Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select className="form-select w-full rounded-md border-gray-300">
                            <option>All Branches</option>
                            <option>Computer Science</option>
                            <option>Information Technology</option>
                        </select>
                         <select className="form-select w-full rounded-md border-gray-300">
                            <option>All Companies</option>
                            <option>Google</option>
                            <option>Microsoft</option>
                        </select>
                        <button className="w-full bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90">Apply Filters</button>
                    </div>
                </div>

                 <div className="bg-surface p-6 rounded-lg shadow-card">
                     <p className="text-text-secondary text-center">Filtered report data will be displayed here.</p>
                 </div>
            </main>
        </div>
    );
};

export default ReportsPage;