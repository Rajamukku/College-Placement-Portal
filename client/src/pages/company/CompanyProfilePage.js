import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import toast from 'react-hot-toast';
import { BuildingOffice2Icon, IdentificationIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const CompanyProfilePage = () => {
    const [profile, setProfile] = useState({
        name: '',
        companyId: '',
        email: '',
        website: '',
        description: '',
        industry: '',
        hrName: '',
        hrContact: '',
        logoUrl: 'https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg'
    });
    const [isLoading, setIsLoading] = useState(true);
    const formRef = React.useRef(null);

    useEffect(() => {
        const fetchCompanyProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    setIsLoading(false);
                    return;
                }
                
                const response = await axios.get('http://localhost:5000/api/companies/me', {
                    headers: { 'x-auth-token': token }
                });
                
                if (response.data && response.data.success) {
                    const companyData = response.data.data;
                    setProfile(prev => ({
                        ...prev,
                        name: companyData.name || '',
                        companyId: companyData.companyId || '',
                        email: companyData.user?.email || companyData.email || '',
                        website: companyData.website || '',
                        description: companyData.description || '',
                        industry: companyData.industry || '',
                        hrName: companyData.hrName || '',
                        hrContact: companyData.hrContact || '',
                    }));
                } else {
                    throw new Error(response.data?.message || 'Invalid response from server');
                }
            } catch (error) {
                console.error('Error fetching company profile:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load company profile';
                
                // More specific error messages
                if (error.response?.status === 404) {
                    toast.error('Company profile not found. Please contact admin to create your company profile.');
                } else if (error.response?.status === 401 || error.response?.status === 403) {
                    toast.error('Authentication failed. Please login again.');
                } else if (error.response?.status === 500) {
                    toast.error('Server error. Please try again later or contact support.');
                } else {
                    toast.error(errorMessage);
                }
                
                // Still show the form even if there's an error, but with a message
                if (error.response?.status === 404) {
                    // Show a message but allow user to see the page
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyProfile();
    }, []);

    const handleInputChange = (e) => { 
        setProfile({ ...profile, [e.target.name]: e.target.value }); 
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Don't send email as it's read-only
            const { email, logoUrl, ...updateData } = profile;
            const response = await axios.put('http://localhost:5000/api/companies/profile', updateData, {
                headers: { 'x-auth-token': token }
            });
            if (response.data.success) {
                toast.success('Company profile updated successfully!');
                // Update the profile with the response data
                const companyData = response.data.data;
                setProfile(prev => ({
                    ...prev,
                    ...companyData,
                    email: companyData.user?.email || prev.email
                }));
            }
        } catch (error) {
            console.error('Error updating company profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header userType="company" />
                <main className="max-w-4xl mx-auto py-10 px-4">
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-secondary">Loading company profile...</p>
                    </div>
                </main>
            </div>
        );
    }

    return ( 
        <div className="min-h-screen bg-background">
            <Header userType="company" />
            <main className="max-w-4xl mx-auto py-10 px-4">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <img src={profile.logoUrl} alt="Company Logo" className="h-16 w-16 object-contain p-1 border rounded-md"/>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-text-primary">Company Profile</h1>
                        <p className="text-text-secondary">Update your company's public information.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90"
                    >
                        Edit Profile
                    </button>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-card space-y-6">
                    {/* --- Company Details --- */}
                    <h2 className="text-lg font-semibold text-primary border-b pb-2">Company Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Company Name</label>
                            <input type="text" name="name" id="name" value={profile.name} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" required />
                        </div>
                        <div className="relative">
                            <label htmlFor="companyId" className="block text-sm font-medium text-text-secondary">Company ID</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 sm:text-sm">
                                    <IdentificationIcon className="h-4 w-4" />
                                </span>
                                <input 
                                    type="text" 
                                    name="companyId" 
                                    id="companyId" 
                                    value={profile.companyId} 
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-gray-300 bg-gray-100 cursor-not-allowed" 
                                    readOnly 
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Your unique company identifier</p>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Contact Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={profile.email} 
                                className="mt-1 w-full form-input rounded-md bg-gray-100 cursor-not-allowed" 
                                readOnly 
                                disabled
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact admin for email updates.</p>
                        </div>
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-text-secondary">Website</label>
                            <input type="url" name="website" id="website" value={profile.website} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-text-secondary">Industry</label>
                            <input type="text" name="industry" id="industry" value={profile.industry} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="hrName" className="block text-sm font-medium text-text-secondary">HR Contact Name</label>
                            <input type="text" name="hrName" id="hrName" value={profile.hrName} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="hrContact" className="block text-sm font-medium text-text-secondary">HR Contact Email/Phone</label>
                            <input type="text" name="hrContact" id="hrContact" value={profile.hrContact} onChange={handleInputChange} className="mt-1 w-full form-input rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Company Description</label>
                            <textarea name="description" id="description" rows={4} value={profile.description} onChange={handleInputChange} className="mt-1 w-full form-textarea rounded-md"></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90">
                            Save Changes
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CompanyProfilePage;