import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';

const InterviewFeedbackModal = ({ isOpen, student, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        round: 'Technical Round 1',
        date: '',
        interviewer: '',
        verdict: 'On Hold',
        feedback: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (!formData.date || !formData.interviewer || !formData.feedback) {
            toast.error("Please fill all fields.");
            return;
        }
        onSave(student.id, formData);
        toast.success(`Feedback saved for ${student.name}`);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-bold text-primary">
                        Interview Feedback for {student.name}
                    </Dialog.Title>
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Interview Round</label>
                                <select name="round" value={formData.round} onChange={handleChange} className="mt-1 w-full form-select rounded-md">
                                    <option>Technical Round 1</option>
                                    <option>Technical Round 2</option>
                                    <option>HR Round</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Verdict</label>
                                <select name="verdict" value={formData.verdict} onChange={handleChange} className="mt-1 w-full form-select rounded-md">
                                    <option>Progress to Next Round</option>
                                    <option>On Hold</option>
                                    <option>Rejected</option>
                                    <option>Hired</option>
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Interview Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 w-full form-input rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Interviewer(s)</label>
                                <input type="text" name="interviewer" value={formData.interviewer} onChange={handleChange} placeholder="e.g., Mr. John Doe" className="mt-1 w-full form-input rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Feedback & Notes</label>
                            <textarea name="feedback" rows="4" value={formData.feedback} onChange={handleChange} className="mt-1 w-full form-textarea rounded-md" placeholder="Candidate's strengths, weaknesses, etc."></textarea>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90">Save Feedback</button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default InterviewFeedbackModal;