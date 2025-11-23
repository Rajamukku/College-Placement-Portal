import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
    XMarkIcon, UserCircleIcon, AcademicCapIcon, DocumentTextIcon, CodeBracketIcon, 
    BuildingOfficeIcon, TrophyIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon 
} from '@heroicons/react/24/outline';

// A reusable component for sections
const ProfileSection = ({ title, icon: Icon, children }) => (
    <div className="pt-4 border-t">
        <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <Icon className="h-6 w-6" />
            {title}
        </h4>
        {children}
    </div>
);

const StudentProfileModal = ({ student, onClose }) => {
    const [newNote, setNewNote] = useState('');
    const [notes, setNotes] = useState(student?.internalNotes || []);

    if (!student) return null;

    // Handle data structure from API - student data might be flat or nested
    const studentName = student.name || 'Unknown';
    const studentId = student.studentId || student.id || 'N/A';
    const studentBranch = student.branch || 'N/A';
    const studentEmail = student.email || 'N/A';
    const studentPhone = student.phone || 'N/A';
    const studentCPI = student.academics?.cpi || student.academics?.CGPA || 'N/A';
    
    // Handle skills - could be string, array, or undefined
    let studentSkills = '';
    if (student.skills) {
        if (Array.isArray(student.skills)) {
            studentSkills = student.skills.join(', ');
        } else if (typeof student.skills === 'string') {
            studentSkills = student.skills;
        } else {
            studentSkills = String(student.skills);
        }
    }
    
    const studentProjects = student.projects || [];
    const studentInternships = student.internships || [];
    const studentAchievements = student.achievements || [];
    const studentResumeLink = student.resumeLink || student.resume || '';
    const marksheets = student.marksheets || {};

    return (
        <Dialog open={!!student} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl h-[90vh] flex flex-col rounded-lg bg-white shadow-xl">
                    <div className="flex justify-between items-center p-4 border-b">
                        <Dialog.Title className="text-xl font-bold text-primary">Student Profile</Dialog.Title>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* --- Header & Contact --- */}
                        <div className="flex items-center gap-4">
                            <UserCircleIcon className="h-20 w-20 text-accent flex-shrink-0"/>
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary">{studentName}</h3>
                                <p className="text-text-secondary">{studentId} ({studentBranch})</p>
                                <p className="text-sm text-text-secondary">{studentEmail} | {studentPhone}</p>
                            </div>
                        </div>

                        {/* --- ELIGIBILITY SNAPSHOT --- */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-100 p-3 rounded-md">
                                <p className="font-bold text-lg text-text-primary">{studentCPI}</p>
                                <p className="text-xs text-text-secondary uppercase">Current CPI</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-md">
                                <p className="font-bold text-lg text-text-primary">{studentBranch}</p>
                                <p className="text-xs text-text-secondary uppercase">Branch</p>
                            </div>
                            {studentResumeLink && (
                                <div className="bg-gray-100 p-3 rounded-md flex items-center justify-center">
                                    <a href={studentResumeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline font-semibold">
                                        <DocumentTextIcon className="h-6 w-6"/>
                                        <span className="text-sm">View Resume</span>
                                    </a>
                                </div>
                            )}
                            {studentSkills && (
                                <div className="bg-gray-100 p-3 rounded-md">
                                    <p className="font-bold text-lg text-text-primary text-xs">
                                        {studentSkills.length > 20 ? `${studentSkills.substring(0, 20)}...` : studentSkills}
                                    </p>
                                    <p className="text-xs text-text-secondary uppercase">Skills</p>
                                </div>
                            )}
                        </div>

                        {/* --- Skills Section --- */}
                        {studentSkills && (
                            <ProfileSection title="Skills" icon={CodeBracketIcon}>
                                <div className="flex flex-wrap gap-2">
                                    {studentSkills.split(',').map((skill, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </ProfileSection>
                        )}

                        {/* --- Academics Section --- */}
                        <ProfileSection title="Academics" icon={AcademicCapIcon}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-text-secondary">10th %</div>
                                    <div className="font-semibold">{student.academics?.tenth ?? '—'}</div>
                                    {marksheets.tenth?.pdfUrl && <a className="text-xs text-primary underline" href={marksheets.tenth.pdfUrl} target="_blank" rel="noreferrer">10th PDF</a>}
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-text-secondary">12th %</div>
                                    <div className="font-semibold">{student.academics?.twelfth ?? '—'}</div>
                                    {marksheets.inter?.pdfUrl && <a className="text-xs text-primary underline" href={marksheets.inter.pdfUrl} target="_blank" rel="noreferrer">Inter PDF</a>}
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-text-secondary">CPI</div>
                                    <div className="font-semibold">{student.academics?.cpi ?? '—'}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <div className="text-text-secondary">CGPA</div>
                                    <div className="font-semibold">{marksheets.cgpa?.value ?? '—'}</div>
                                    {marksheets.cgpa?.pdfUrl && <a className="text-xs text-primary underline" href={marksheets.cgpa.pdfUrl} target="_blank" rel="noreferrer">CGPA PDF</a>}
                                </div>
                            </div>
                            {/* Semesters */}
                            {Array.isArray(marksheets.semesters) && marksheets.semesters.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-sm font-semibold mb-2">Semester Results</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {marksheets.semesters.map((s, idx) => (
                                            <div key={idx} className="p-3 border rounded flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">Sem {s.sem}</div>
                                                    <div className="text-xs text-text-secondary">SGPA: {s.sgpa} {typeof s.backlogs === 'number' ? `(Backlogs: ${s.backlogs})` : ''}</div>
                                                </div>
                                                {s.pdfUrl && <a className="text-primary underline text-sm" href={s.pdfUrl} target="_blank" rel="noreferrer">PDF</a>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ProfileSection>

                        {/* --- Projects Section --- */}
                        {studentProjects.length > 0 && (
                            <ProfileSection title="Projects" icon={CodeBracketIcon}>
                                <div className="space-y-4">
                                    {studentProjects.map((project, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-info">
                                            <div className="flex justify-between items-center">
                                                <h5 className="font-semibold text-text-primary">{project.title || project.name || `Project ${index + 1}`}</h5>
                                                {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-medium hover:underline">View Code &rarr;</a>}
                                            </div>
                                            {project.description && <p className="text-sm text-text-secondary mt-1">{project.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </ProfileSection>
                        )}

                        {/* --- Internships Section --- */}
                        {studentInternships.length > 0 && (
                            <ProfileSection title="Internships & Experience" icon={BuildingOfficeIcon}>
                               <div className="space-y-4">
                                    {studentInternships.map((internship, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-secondary">
                                            <h5 className="font-semibold text-text-primary">{internship.role || 'Role'} at <span className="text-primary">{internship.company || 'Company'}</span></h5>
                                            {internship.duration && <p className="text-xs text-text-secondary font-medium">{internship.duration}</p>}
                                            {internship.description && <p className="text-sm text-text-secondary mt-1">{internship.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </ProfileSection>
                        )}

                        {/* --- Achievements Section --- */}
                        {studentAchievements.length > 0 && (
                            <ProfileSection title="Achievements & Certifications" icon={TrophyIcon}>
                                <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                                    {studentAchievements.map((ach, index) => (
                                        <li key={index}>{ach}</li>
                                    ))}
                                </ul>
                            </ProfileSection>
                        )}

                        {studentProjects.length === 0 && studentInternships.length === 0 && studentAchievements.length === 0 && (
                            <p className="text-sm text-text-secondary text-center py-4">No additional information available.</p>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default StudentProfileModal;