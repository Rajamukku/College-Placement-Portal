import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import { SparklesIcon, DocumentArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import { studentAPI } from '../../utils/api';

// --- NEW RESUME PREVIEW COMPONENT ---
// This component displays the generated data in a professional resume format.
const ResumePreview = ({ resumeData }) => {
    if (!resumeData) return null;

    return (
        // The `prose` class from @tailwindcss/typography provides beautiful text styling.
        // The `id` is crucial for the print-to-PDF functionality.
        <div id="resume-preview" className="bg-white p-8 md:p-12 shadow-lg ring-1 ring-gray-200 prose prose-sm max-w-none">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary mb-1">{resumeData.name}</h1>
                <p className="text-text-secondary">{resumeData.contact}</p>
            </header>
            
            <section>
                <h2 className="font-bold text-primary border-b-2 border-primary pb-1">Objective</h2>
                <p className="mt-2 text-text-secondary">{resumeData.objective}</p>
            </section>

            <section>
                <h2 className="font-bold text-primary border-b-2 border-primary pb-1">Experience</h2>
                {resumeData.experience.map((exp, index) => (
                    <div key={index} className="mt-2">
                        <h3 className="font-semibold text-text-primary">{exp.title}</h3>
                        <p className="text-sm text-text-secondary">{exp.details}</p>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="font-bold text-primary border-b-2 border-primary pb-1">Skills</h2>
                <ul className="mt-2 text-text-secondary list-disc pl-5">
                    {resumeData.skills.map((skill, index) => <li key={index}>{skill}</li>)}
                </ul>
            </section>
        </div>
    );
};

const AIResumeBuilder = () => {
    const [userInfo, setUserInfo] = useState('Your Name, B.Tech in Computer Science. Skilled in MERN stack. Completed a placement portal project.');
    const [jobDescription, setJobDescription] = useState('Seeking a Junior Web Developer for our team. Must have strong JavaScript fundamentals and experience with React and Node.js.');
    const [generatedResume, setGeneratedResume] = useState(null); // Will hold structured resume data
    const [isLoading, setIsLoading] = useState(false);
    const [resumeIsGenerated, setResumeIsGenerated] = useState(false);
    const navigate = useNavigate();

    // Fetch logged-in student name to replace the placeholder "Your Name"
    useEffect(() => {
        const loadName = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found, skipping student name fetch');
                    return;
                }
                // Use the configured API instance which automatically includes the token
                const res = await studentAPI.getProfile();
                const name = res.data?.student?.name;
                if (name) {
                    setUserInfo(prev => prev.replace(/^Your Name/i, name));
                }
            } catch (e) {
                // non-blocking - silently fail if user profile can't be loaded
                console.log('Could not load student name:', e);
            }
        };
        loadName();
    }, []);

    const handleGenerate = () => {
        setIsLoading(true);
        setGeneratedResume(null);
        setResumeIsGenerated(false);

        setTimeout(() => {
            // The AI now returns structured data, not just text
            const candidateName = (userInfo.split(',')[0] || '').trim() || 'Student Name';
            const emailSlug = candidateName.toLowerCase().replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,'');
            const mockResponse = {
                name: candidateName,
                contact: `${emailSlug}@pu-student.com | 9876543210 | linkedin.com/in/${emailSlug}`,
                objective: 'A highly motivated Computer Science student with proven experience in the MERN stack seeking a challenging Junior Web Developer role to leverage my skills in building high-quality, scalable web applications.',
                experience: [
                    { title: 'College Placement Portal (Project)', details: 'Developed a full-stack MERN application featuring separate portals for students, companies, and admins. Implemented AI-powered features for resume building and candidate screening.' },
                ],
                skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript (ES6+)', 'Tailwind CSS', 'REST APIs'],
            };
            setGeneratedResume(mockResponse);
            setIsLoading(false);
            setResumeIsGenerated(true);
            toast.success('Your new resume has been generated!');
        }, 2000);
    };

    const handleSaveResume = async () => {
        try {
            // Convert HTML resume to PDF using html2canvas and jsPDF
            const resumeElement = document.getElementById('resume-preview');
            if (!resumeElement) {
                toast.error('Resume preview not found');
                return;
            }

            // Dynamically import html2canvas and jsPDF
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            toast.loading('Generating PDF...', { id: 'pdf-gen' });

            // Convert HTML to canvas
            const canvas = await html2canvas(resumeElement, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            // Convert canvas to PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgScaledWidth = imgWidth * ratio;
            const imgScaledHeight = imgHeight * ratio;
            const xOffset = (pdfWidth - imgScaledWidth) / 2;
            const yOffset = 0;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
            const pdfBlob = pdf.output('blob');

            // Upload PDF to server
            toast.loading('Uploading resume...', { id: 'pdf-upload' });
            const formData = new FormData();
            const nameForFile = (generatedResume?.name || 'resume').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,'-');
            const pdfFile = new File([pdfBlob], `${nameForFile}-${Date.now()}.pdf`, { type: 'application/pdf' });
            formData.append('pdf', pdfFile);

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue', { id: 'pdf-upload' });
                return;
            }

            // Don't set Content-Type manually - axios will set it automatically with boundary for FormData
            // Ensure token is included in headers
            const headers = {
                'x-auth-token': token
            };
            
            const response = await axios.post('http://localhost:5000/api/students/resume', formData, {
                headers: headers
                // Content-Type will be set automatically by axios for FormData
            });

            if (response.data && response.data.resumeLink) {
                toast.success('Resume saved successfully!', { id: 'pdf-upload' });
                setTimeout(() => navigate('/student/profile'), 1500);
            } else {
                throw new Error('Failed to save resume');
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            toast.error(error.response?.data?.msg || error.message || 'Failed to save resume', { id: 'pdf-upload' });
        }
    };

    const handleDownloadPdf = () => {
        // Uses the browser's built-in print functionality to create a PDF
        const originalTitle = document.title;
        const nameForFile = (generatedResume?.name || 'resume').replace(/[^a-zA-Z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
        document.title = `${nameForFile}-Resume`;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 500);
    };

    return (
        <div className="bg-background min-h-screen">
            <Header />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <div className="text-center">
                    <SparklesIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h1 className="text-4xl font-bold text-primary mt-2">AI Resume Generator</h1>
                    <p className="mt-2 text-lg text-text-secondary">Generate a professional, downloadable resume in seconds.</p>
                </div>

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Input Section */}
                    <div className="lg:col-span-1 space-y-6 bg-surface p-6 rounded-lg shadow-card">
                        <div>
                            <label htmlFor="userInfo" className="block text-sm font-medium text-text-secondary">Your Key Skills & Experience</label>
                            <textarea id="userInfo" rows={5} className="mt-1 block w-full form-input rounded-md" value={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="jobDescription" className="block text-sm font-medium text-text-secondary">Paste Job Description</label>
                            <textarea id="jobDescription" rows={8} className="mt-1 block w-full form-input rounded-md" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-secondary text-white py-3 px-4 rounded-md font-semibold hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center transition-colors">
                            {isLoading ? 'Generating...' : 'Generate Resume'}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-primary mb-4">Resume Preview</h2>
                        <div className="bg-gray-200 p-4 rounded-lg min-h-[500px]">
                            {isLoading && (<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div></div>)}
                            
                            <ResumePreview resumeData={generatedResume} />
                            
                            {!isLoading && !generatedResume && (
                                <div className="text-center text-text-secondary py-10 border-2 border-dashed rounded-lg">
                                    Your generated resume preview will appear here.
                                </div>
                            )}
                        </div>

                        {/* Action Buttons for Generated Resume */}
                        {resumeIsGenerated && (
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleSaveResume} className="w-full flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-all">
                                    <CheckCircleIcon className="h-6 w-6"/>
                                    Use This Resume
                                </button>
                                <button onClick={handleDownloadPdf} className="w-full flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-all">
                                    <DocumentArrowDownIcon className="h-6 w-6"/>
                                    Download as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIResumeBuilder;