import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddUserModal = ({ isOpen, onClose, userType, onConfirm }) => {
    // Use a single state object to hold all form data
    const [formData, setFormData] = useState({});

    // When the modal opens or userType changes, reset the form data to its initial state
    useEffect(() => {
        if (isOpen) {
            if (userType === 'student') {
                setFormData({
                    name: '',
                    studentId: '',
                    email: '',
                    password: '',
                    branch: '',
                });
            } else if (userType === 'company') {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    companyId: '',
                    website: '',
                    description: '',
                    industry: '',
                    hrName: '',
                    hrContact: ''
                });
            }
        }
    }, [isOpen, userType]);

    // A single, generic handler to update the formData state object
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Auto-generate student email from Student ID for convenience
    const handleStudentIdChange = (e) => {
        const { name, value } = e.target;
        const cleaned = (value || '').replace(/-/g, '');
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
            email: cleaned ? `${cleaned}@pu-student.com` : '', // Auto-populate email without '-'
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // The onConfirm function is passed the complete, up-to-date formData object
        onConfirm(formData);
    };

    if (!isOpen) return null;

    const renderStudentForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full Name*" name="name" value={formData.name || ''} onChange={handleChange} required />
            <InputField label="Student ID*" name="studentId" value={formData.studentId || ''} onChange={handleStudentIdChange} required />
            <InputField label="Email Address*" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
            <InputField label="Branch*" name="branch" value={formData.branch || ''} onChange={handleChange} required />
            <InputField label="Initial Password*" name="password" type="password" value={formData.password || ''} onChange={handleChange} required />
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Save Student
                </button>
            </div>
        </form>
    );

    const renderCompanyForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Company Name*" name="name" value={formData.name || ''} onChange={handleChange} required />
                <InputField label="Company ID*" name="companyId" value={formData.companyId || ''} onChange={handleChange} required />
                <InputField label="Contact Email*" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                <InputField label="Password*" name="password" type="password" value={formData.password || ''} onChange={handleChange} required />
                <InputField label="Website" name="website" type="url" value={formData.website || ''} onChange={handleChange} />
                <InputField label="Industry" name="industry" value={formData.industry || ''} onChange={handleChange} />
                <InputField label="HR Name" name="hrName" value={formData.hrName || ''} onChange={handleChange} />
                <InputField label="HR Contact" name="hrContact" value={formData.hrContact || ''} onChange={handleChange} />
                <div className="md:col-span-2">
                    <InputField label="Description" name="description" type="textarea" value={formData.description || ''} onChange={handleChange} />
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Save Company
                </button>
            </div>
        </form>
    );

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                    <div className="flex justify-between items-center">
                        <Dialog.Title className="text-xl font-bold text-primary">
                            Add New {userType === 'student' ? 'Student' : 'Company'}
                        </Dialog.Title>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6" /></button>
                    </div>

                    {userType === 'student' ? renderStudentForm() : renderCompanyForm()}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

// Reusable Input Field Component for a cleaner form
const InputField = ({ label, name, type = 'text', value, onChange, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 w-full form-input rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
    </div>
);

export default AddUserModal;