// client/src/components/admin/AdminEditStudentModal.js

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const InputField = ({ label, name, type = 'text', value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label}</label>
        <input
            id={name} name={name} type={type} value={value} onChange={onChange}
            className="mt-1 w-full form-input rounded-md border-gray-300"
        />
    </div>
);

const AdminEditStudentModal = ({ isOpen, onClose, student, onConfirm }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Pre-fill the form when a student is selected
        if (student) {
            setFormData({
                name: student.name || '',
                phone: student.phone || '',
                branch: student.branch || '',
                cpi: student.academics?.cpi || '',
                tenth: student.academics?.tenth || '',
                twelfth: student.academics?.twelfth || '',
            });
        }
    }, [student]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            name: formData.name,
            phone: formData.phone,
            branch: formData.branch,
            academics: {
                cpi: formData.cpi,
                tenth: formData.tenth,
                twelfth: formData.twelfth,
            }
        };
        onConfirm(student._id, updatedData);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-bold text-primary">
                        Edit Profile for {student.name}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                        <InputField label="Branch" name="branch" value={formData.branch} onChange={handleChange} />
                        
                        <h4 className="text-md font-semibold pt-4 border-t text-text-primary">Academics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="10th %" name="tenth" type="number" value={formData.tenth} onChange={handleChange} />
                            <InputField label="12th %" name="twelfth" type="number" value={formData.twelfth} onChange={handleChange} />
                            <InputField label="Current CPI" name="cpi" type="number" value={formData.cpi} onChange={handleChange} />
                        </div>
                        
                        <div className="pt-6 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90">Save Changes</button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default AdminEditStudentModal;