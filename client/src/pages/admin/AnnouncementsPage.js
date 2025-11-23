import React from 'react';
import Header from '../../components/common/Header';
import { MegaphoneIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Mock data
const announcements = [
    { id: 1, title: 'Mega Recruitment Drive by Tech Innovators Inc.', date: '2023-11-05' },
    { id: 2, title: 'Deadline to update profiles: October 30th', date: '2023-10-26' },
];

const AnnouncementsPage = () => {
    
    const handleCreate = () => {
        // Logic to open a modal or navigate to a "new announcement" page
        toast.success('New announcement created!');
    };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Manage Announcements</h1>
                    <button 
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all"
                    >
                        <MegaphoneIcon className="h-5 w-5" />
                        Create New
                    </button>
                </div>

                <div className="bg-surface rounded-lg shadow-card p-6">
                    <ul className="divide-y divide-gray-200">
                        {announcements.map(ann => (
                            <li key={ann.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold text-text-primary">{ann.title}</p>
                                    <p className="text-sm text-text-secondary">Posted on: {ann.date}</p>
                                </div>
                                <div className="flex space-x-4">
                                    <button className="text-info hover:text-opacity-80"><PencilIcon className="h-5 w-5" /></button>
                                    <button className="text-danger hover:text-opacity-80"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default AnnouncementsPage;