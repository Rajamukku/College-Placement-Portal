// client/src/components/admin/AdminEditCompanyModal.js

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

const AdminEditCompanyModal = ({ isOpen, onClose, company, onConfirm }) => {
    const [formData, setFormData] = useState({ name: '', website: '' });

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name || '',
                website: company.website || '',
            });
        }
    }, [company]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(company._id, formData);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-bold text-primary">
                        Edit Company: {company.name}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Company Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full form-input rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Company Website</label>
                            <input name="website" type="url" value={formData.website} onChange={handleChange} className="mt-1 w-full form-input rounded-md"/>
                        </div>
                        
                        <div className="pt-6 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-md">Cancel</button>
                            <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md">Save Changes</button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default AdminEditCompanyModal;   