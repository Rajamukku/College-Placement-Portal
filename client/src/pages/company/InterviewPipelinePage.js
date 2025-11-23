import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

// In a real app, this data would be fetched from your backend and updated via drag-and-drop actions.
const emptyPipeline = { shortlisted: [], technicalRound: [], hrRound: [], offered: [] };

const buildColumns = (pipelineData) => ([
    { id: 'shortlisted', title: 'Shortlisted', data: pipelineData.shortlisted, color: 'border-t-warning' },
    { id: 'technicalRound', title: 'Technical Interview', data: pipelineData.technicalRound, color: 'border-t-info' },
    { id: 'hrRound', title: 'HR Interview', data: pipelineData.hrRound, color: 'border-t-accent' },
    { id: 'offered', title: 'Offer Extended', data: pipelineData.offered, color: 'border-t-success' },
]);

const CandidateCard = ({ candidate }) => (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-3 cursor-grab hover:shadow-md transition-shadow">
        <p className="font-semibold text-text-primary text-sm">{candidate.name}</p>
        <div className="flex items-center text-xs text-text-secondary mt-2">
            <BriefcaseIcon className="h-3.5 w-3.5 mr-1.5"/>
            <span>{candidate.job}</span>
        </div>
    </div>
);

const PipelineColumn = ({ column }) => (
    <div className="bg-surface rounded-lg w-80 flex-shrink-0 flex flex-col h-full shadow-card">
        <div className={`p-3 border-b-2 border-t-4 ${column.color}`}>
            <h3 className="font-bold text-primary">{column.title}
                <span className="text-sm font-medium text-text-secondary ml-2 bg-gray-200 px-2 py-0.5 rounded-full">{column.data.length}</span>
            </h3>
        </div>
        <div className="p-3 flex-1 overflow-y-auto bg-gray-50">
            {column.data.map(candidate => <CandidateCard key={candidate.id} candidate={candidate} />)}
        </div>
    </div>
);


const InterviewPipelinePage = () => {
    const [pipeline, setPipeline] = useState(emptyPipeline);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    setIsLoading(false);
                    return;
                }
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/jobs/summary', config).catch(err => {
                    console.error('Error fetching pipeline:', err);
                    return { data: {} };
                });
                const p = res.data?.pipeline || {};
                // We do not yet have candidate lists per stage; show counts only
                setPipeline({
                    shortlisted: Array(p.shortlisted || 0).fill({ id: '', name: '—', job: '' }),
                    technicalRound: Array(p.interview || 0).fill({ id: '', name: '—', job: '' }),
                    hrRound: Array(p.hold || 0).fill({ id: '', name: '—', job: '' }),
                    offered: Array(p.hired || 0).fill({ id: '', name: '—', job: '' }),
                });
            } catch (e) {
                console.error('Pipeline load error:', e);
                toast.error(e.response?.data?.msg || 'Failed to load pipeline');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const pipelineColumns = buildColumns(pipeline);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header userType="company" />
            <main className="flex-1 flex flex-col max-w-full py-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Hiring Pipeline</h1>
                <p className="text-md text-text-secondary mb-8">Visually track candidates across all interview stages.</p>
                <p className="text-xs text-text-secondary mb-4 italic">Note: Drag-and-drop functionality would be added with a library like 'react-beautiful-dnd'.</p>
                <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                    {isLoading ? <div className="text-text-secondary">Loading pipeline...</div> : pipelineColumns.map(col => <PipelineColumn key={col.id} column={col} />)}
                </div>
            </main>
        </div>
    );
};

export default InterviewPipelinePage;