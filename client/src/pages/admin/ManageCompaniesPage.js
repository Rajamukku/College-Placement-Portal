// File: client/src/pages/admin/ManageCompaniesPage.js

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';
import AddUserModal from '../../components/admin/AddUserModal';
import AdminEditCompanyModal from '../../components/admin/AdminEditCompanyModal';
import toast from 'react-hot-toast';
import { KeyIcon, BuildingOffice2Icon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { debounce } from 'lodash';

const ManageCompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null); // For password change
    const [editingCompany, setEditingCompany] = useState(null); // For editing details
    const [searchQuery, setSearchQuery] = useState('');
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [page] = useState(1);
    const [limit] = useState(20);
    const forceRefetch = () => setRefetchTrigger(c => c + 1);

    const fetchCompanies = useCallback(async (search = '') => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const response = await axios.get(`http://localhost:5000/api/admin/companies?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`, config);
            
            if (response.data && response.data.success) {
                setCompanies(response.data.companies || []);
            } else {
                toast.error(response.data?.message || "Failed to fetch companies");
                setCompanies([]);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
            } else {
                toast.error(err.response?.data?.message || "Could not fetch companies.");
            }
            setCompanies([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        const debouncedSearch = debounce(() => { fetchCompanies(searchQuery); }, 300);
        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [searchQuery, fetchCompanies]);

    useEffect(() => {
        fetchCompanies();
    }, [refetchTrigger, fetchCompanies]);

    // Refresh list when window regains focus (useful after edits)
    useEffect(() => {
        const onFocus = () => fetchCompanies(searchQuery);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchCompanies, searchQuery]);

    // NEW: Function to fetch full company details before opening the edit modal
    const handleOpenEditModal = async (companyId) => {
        const loadingToast = toast.loading('Fetching details...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const response = await axios.get(`http://localhost:5000/api/admin/company/${companyId}`, config);
            toast.dismiss(loadingToast);
            if (response.data.success) {
                setEditingCompany(response.data.data);
            } else {
                toast.error('Could not fetch company details.');
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error('Failed to fetch company details.');
        }
    };

    const handleUpdateCompany = async (companyId, formData) => {
        const loadingToast = toast.loading('Updating company...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/admin/company/${companyId}`, formData, config);
            toast.dismiss(loadingToast);
            toast.success('Company updated successfully!');
            setEditingCompany(null);
            forceRefetch();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || 'Failed to update company.');
        }
    };

    const handleChangePassword = async (newPassword) => {
        if (!selectedCompany?._id) {
            toast.error("Cannot change password: Company ID is missing.");
            return;
        }
        const loadingToast = toast.loading("Updating password...");
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/admin/company/${selectedCompany._id}/change-password`, { newPassword }, config);
            toast.dismiss(loadingToast);
            toast.success(`Password for ${selectedCompany.name} updated!`);
            setSelectedCompany(null);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || "Failed to change password.");
        }
    };
    
    const handleDeleteCompany = async (company) => {
        if (window.confirm(`Are you sure you want to delete ${company.name}? This will also delete their user account and all job postings. This action cannot be undone.`)) {
            const loadingToast = toast.loading('Deleting company...');
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                await axios.delete(`http://localhost:5000/api/admin/company/${company._id}`, config);
                toast.dismiss(loadingToast);
                toast.success('Company deleted successfully!');
                forceRefetch();
            } catch (err) {
                toast.dismiss(loadingToast);
                toast.error(err.response?.data?.message || 'Failed to delete company.');
            }
        }
    };

    const handleAddCompany = async (formData) => {
        const loadingToast = toast.loading('Creating company...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.post('http://localhost:5000/api/admin/add-company', formData, config);
            toast.dismiss(loadingToast);
            toast.success('Company created successfully!');
            setIsAddModalOpen(false);
            forceRefetch();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || 'Failed to create company');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex-1 text-left w-full">
                        <h1 className="text-3xl font-bold text-text-primary">Manage Companies</h1>
                        <p className="mt-1 text-sm text-text-secondary">Search, view, add, and edit company profiles.</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-4">
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search by name or email..." />
                        <button onClick={() => fetchCompanies(searchQuery)} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Refresh</button>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 flex-shrink-0">
                            <BuildingOffice2Icon className="h-5 w-5" /> Add Company
                        </button>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-lg shadow-card overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Company Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Contact Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Website</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? ( 
                                <tr><td colSpan="4" className="text-center py-10 text-gray-500">Loading companies...</td></tr>
                            ) : companies.length > 0 ? (
                                companies.map(company => (
                                    <tr key={company._id}>
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                {company.name}
                                                {!company.isActive && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactive</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{company.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {company.website ? (
                                                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                                    {company.website}
                                                </a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <button onClick={() => handleOpenEditModal(company._id)} title="Edit Company" className="p-1 hover:bg-gray-100 rounded">
                                                    <PencilIcon className="h-5 w-5 text-warning"/>
                                                </button>
                                                <button onClick={() => setSelectedCompany(company)} title="Change Password" className="p-1 hover:bg-gray-100 rounded">
                                                    <KeyIcon className="h-5 w-5 text-primary"/>
                                                </button>
                                                <button onClick={() => handleDeleteCompany(company)} title="Delete Company" className="p-1 hover:bg-gray-100 rounded">
                                                    <TrashIcon className="h-5 w-5 text-danger"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : ( 
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">
                                        No companies found. Try adjusting your search or add a new company.
                                    </td>
                                </tr> 
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            <AdminEditCompanyModal isOpen={!!editingCompany} onClose={() => setEditingCompany(null)} company={editingCompany} onConfirm={handleUpdateCompany} />
            {selectedCompany && <ChangePasswordModal isOpen={!!selectedCompany} onClose={() => setSelectedCompany(null)} onConfirm={handleChangePassword} targetName={selectedCompany.name}/>}
            <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} userType="company" onConfirm={handleAddCompany}/>
        </div>
    );
};
export default ManageCompaniesPage;