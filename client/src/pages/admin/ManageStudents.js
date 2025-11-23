// File: client/src/pages/admin/ManageStudents.js

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar';
import AddUserModal from '../../components/admin/AddUserModal';
import AdminStudentProfileModal from '../../components/admin/AdminStudentProfileModal';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';
import AdminEditStudentModal from '../../components/admin/AdminEditStudentModal';
import toast from 'react-hot-toast';
import { 
    UserPlusIcon, 
    EyeIcon, 
    KeyIcon, 
    TrashIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { debounce } from 'lodash';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewedStudent, setViewedStudent] = useState(null);
    const [passwordChangeStudent, setPasswordChangeStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const forceRefetch = () => setRefetchTrigger(c => c + 1);

    const fetchStudents = useCallback(async (page, search) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const response = await axios.get(`http://localhost:5000/api/admin/students?page=${page}&search=${search || ''}`, config);
            const { data } = response;
            
            if (data.success) {
                setStudents(data.students || []);
                setCurrentPage(data.currentPage || 1);
                setTotalPages(data.totalPages || 1);
                setTotalStudents(data.total || 0);
            } else {
                toast.error(data.message || "Could not fetch students.");
                setStudents([]);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not fetch students.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const debouncedSearch = debounce(() => {
            setCurrentPage(1);
            fetchStudents(1, searchQuery);
        }, 500);

        debouncedSearch();
        return () => debouncedSearch.cancel();
    }, [searchQuery, fetchStudents]);

    useEffect(() => {
        fetchStudents(currentPage, searchQuery);
    }, [currentPage, refetchTrigger]);


    const handleAddStudent = async (formData) => {
        const loadingToast = toast.loading('Creating student...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.post('http://localhost:5000/api/admin/add-student', formData, config);
            toast.dismiss(loadingToast);
            toast.success('Student created successfully!');
            setIsAddModalOpen(false);
            forceRefetch();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || 'Failed to create student.');
        }
    };

    const handleUpdateStudent = async (studentId, updatedData) => {
        const loadingToast = toast.loading('Updating profile...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/admin/student/${studentId}`, updatedData, config);
            toast.dismiss(loadingToast);
            toast.success('Profile updated!');
            setEditingStudent(null);
            forceRefetch();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    const handleChangePassword = async (newPassword) => {
        if (!passwordChangeStudent) return;
        const loadingToast = toast.loading('Updating password...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/admin/student/${passwordChangeStudent._id}/change-password`, { newPassword }, config);
            toast.dismiss(loadingToast);
            toast.success(`Password for ${passwordChangeStudent.name} updated!`);
            setPasswordChangeStudent(null);
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data?.message || "Failed to change password.");
        }
    };

    const handleDeleteStudent = async (student) => {
        if (window.confirm(`Are you sure you want to delete ${student.name}? This cannot be undone.`)) {
            const loadingToast = toast.loading('Deleting student...');
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                await axios.delete(`http://localhost:5000/api/admin/student/${student._id}`, config);
                toast.dismiss(loadingToast);
                toast.success('Student deleted successfully');
                forceRefetch();
            } catch (err) {
                toast.dismiss(loadingToast);
                toast.error(err.response?.data?.message || 'Failed to delete student');
            }
        }
    };
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header userType="admin" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex-1 text-left w-full">
                        <h1 className="text-3xl font-bold text-text-primary">Manage Students</h1>
                        <p className="mt-1 text-sm text-text-secondary">Found {totalStudents} matching students.</p>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-4">
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search by name or ID..." />
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 flex-shrink-0">
                            <UserPlusIcon className="h-5 w-5" /> Add Student
                        </button>
                    </div>
                </div>

                <div className="bg-surface rounded-lg shadow-card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Student ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">
                                        <div className="flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                                        <p className="mt-2">Loading students...</p>
                                    </td></tr>
                                ) : students.length > 0 ? (
                                    students.map(student => (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* FIXED: Added fallback to prevent errors with incomplete data */}
                                                <div className="text-sm font-medium text-gray-900">{student.studentId || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* FIXED: Added fallback for missing data */}
                                                <div className="text-sm font-medium text-gray-900">{student.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                 {/* FIXED: Added fallback for missing data */}
                                                <div className="text-sm text-gray-500">{student.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-center items-center gap-4">
                                                    <button onClick={() => setViewedStudent(student)} className="text-info hover:text-opacity-80" title="View Profile"><EyeIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => setEditingStudent(student)} className="text-warning hover:text-opacity-80" title="Edit Profile"><PencilIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => setPasswordChangeStudent(student)} className="text-primary hover:text-opacity-80" title="Change Password"><KeyIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteStudent(student)} className="text-danger hover:text-opacity-80" title="Delete Student"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                            No students found. Try adjusting your search or add a new student.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {!isLoading && totalStudents > 0 && (
                         <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div><p className="text-sm text-gray-700">Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalStudents)}</span> of <span className="font-medium">{totalStudents}</span> results</p></div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span>Prev</span></button>
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Page {currentPage} of {totalPages || 1}</span>
                                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><span>Next</span></button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <AdminStudentProfileModal student={viewedStudent} onClose={() => setViewedStudent(null)} />
            <AdminEditStudentModal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} student={editingStudent} onConfirm={handleUpdateStudent} />
            {passwordChangeStudent && <ChangePasswordModal isOpen={!!passwordChangeStudent} onClose={() => setPasswordChangeStudent(null)} onConfirm={handleChangePassword} targetName={passwordChangeStudent.name}/>}
            <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} userType="student" onConfirm={handleAddStudent}/>
        </div>
    );
};

export default ManageStudents;