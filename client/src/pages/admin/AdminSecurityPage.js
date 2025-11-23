import React, { useState } from 'react';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const AdminSecurityPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match.");
        }
        if (newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters long.");
        }
        
        const loadingToast = toast.loading("Updating password...");
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const body = { currentPassword, newPassword };

            // This endpoint now correctly corresponds to the new backend route and controller
            await axios.put('http://localhost:5000/api/admin/change-password', body, config);
            
            toast.dismiss(loadingToast);
            toast.success("Password updated successfully!");
            
            // Clear fields on success
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.msg || "Failed to update password.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            <main className="max-w-2xl mx-auto py-10 px-4">
                <div className="bg-surface p-8 rounded-lg shadow-card">
                    <div className="flex items-center gap-4 mb-6">
                        <ShieldCheckIcon className="h-10 w-10 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">Admin Security</h1>
                            <p className="text-text-secondary">Manage your administrator password.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Current Password</label>
                            <input
                                type="password" value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 w-full form-input rounded-md border-gray-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">New Password</label>
                            <input
                                type="password" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 w-full form-input rounded-md border-gray-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Confirm New Password</label>
                            <input
                                type="password" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full form-input rounded-md border-gray-300"
                                required
                            />
                        </div>
                        <div className="pt-4 text-right">
                            <button type="submit" className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminSecurityPage;