import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ChangePasswordModal = ({ isOpen, onClose, onConfirm, targetName }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!newPassword || !confirmPassword) {
            setError('Both fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        
        onConfirm(newPassword);
        // Reset state and close
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-primary mb-2">Change Password</h2>
                <p className="text-text-secondary mb-6">You are changing the password for: <span className="font-semibold text-text-primary">{targetName}</span></p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 w-full form-input rounded-md border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full form-input rounded-md border-gray-300"
                        />
                    </div>
                </div>

                {error && <p className="text-danger text-sm mt-4">{error}</p>}

                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-text-primary font-semibold rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;