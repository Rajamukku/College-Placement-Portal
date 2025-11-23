import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';

const CommunicationModal = ({ isOpen, student, onClose }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSend = () => {
        if (!subject || !message) {
            toast.error("Subject and message cannot be empty.");
            return;
        }
        // In a real app, an API call would be made here to send the email/notification
        console.log(`Sending to ${student.name} (${student.email}):`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        
        toast.success(`Message sent to ${student.name}!`);
        onClose(); // Close modal on success
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6">
                    <Dialog.Title className="text-xl font-bold text-primary">
                        Send Notification to {student.name}
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-text-secondary mt-1">
                        This message will be sent to the student's registered email.
                    </Dialog.Description>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 w-full form-input rounded-md"
                                placeholder="e.g., Interview Invitation"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Message</label>
                            <textarea
                                rows="5"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="mt-1 w-full form-textarea rounded-md"
                                placeholder="Dear [Student Name]..."
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button onClick={handleSend} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90">Send Message</button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default CommunicationModal;