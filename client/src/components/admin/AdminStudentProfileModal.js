import React from 'react';
import { Dialog } from '@headlessui/react';
import { 
    XMarkIcon, 
    UserCircleIcon, 
    AcademicCapIcon,
    DocumentTextIcon, 
    CodeBracketIcon, 
    BuildingOfficeIcon, 
    TrophyIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarDaysIcon 
} from '@heroicons/react/24/outline';

const ProfileSection = ({ title, icon: Icon, children }) => (
    <div className="pt-4 border-t">
        <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <Icon className="h-6 w-6" />
            {title}
        </h4>
        {children}
    </div>
);

const AdminStudentProfileModal = ({ student, onClose }) => {
    if (!student) return null;

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
                        {/* Header & Contact */}
                        <div className="flex items-center gap-4">
                            <UserCircleIcon className="h-20 w-20 text-accent flex-shrink-0"/>
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary">{student.name}</h3>
                                <p className="text-text-secondary">{student.studentId} ({student.branch})</p>
                                <p className="text-sm text-text-secondary">{student.user?.email}</p>
                            </div>
                        </div>

                        {/* Eligibility Snapshot */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-100 p-3 rounded-md">
                                <p className="font-bold text-lg text-text-primary">{student.academics?.cpi || 'N/A'}</p>
                                <p className="text-xs text-text-secondary uppercase">Current CPI</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-md">
                                <div className="flex items-center justify-center gap-1.5 font-bold text-lg">
                                    {student.activeBacklogs === 0 ? 
                                        <CheckCircleIcon className="h-6 w-6 text-success" /> : 
                                        <XCircleIcon className="h-6 w-6 text-danger" />}
                                    {student.activeBacklogs || 0}
                                </div>
                                <p className="text-xs text-text-secondary uppercase">Active Backlogs</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-md">
                                <p className="font-bold text-lg text-text-primary">{student.graduationYear || 'N/A'}</p>
                                <p className="text-xs text-text-secondary uppercase">Graduation Year</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-md flex items-center justify-center">
                                {student.resumeLink ? (
                                    <a href={student.resumeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline font-semibold">
                                        <DocumentTextIcon className="h-6 w-6"/>
                                        <span className="text-sm">View Resume</span>
                                    </a>
                                ) : (
                                    <p className="text-sm text-text-secondary">No Resume</p>
                                )}
                            </div>
                        </div>

                        {/* Projects Section */}
                        <ProfileSection title="Projects" icon={CodeBracketIcon}>
                            <div className="space-y-4">
                                {student.projects?.length > 0 ? student.projects.map((project, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-info">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-semibold text-text-primary">{project.title}</h5>
                                            {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent font-medium hover:underline">View Code &rarr;</a>}
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">{project.description}</p>
                                    </div>
                                )) : <p className="text-sm text-text-secondary">No projects listed.</p>}
                            </div>
                        </ProfileSection>

                        {/* Internships Section */}
                        <ProfileSection title="Internships & Experience" icon={BuildingOfficeIcon}>
                           <div className="space-y-4">
                                {student.internships?.length > 0 ? student.internships.map((internship, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-secondary">
                                        <h5 className="font-semibold text-text-primary">{internship.role} at <span className="text-primary">{internship.company}</span></h5>
                                        <p className="text-xs text-text-secondary font-medium">{internship.duration}</p>
                                        <p className="text-sm text-text-secondary mt-1">{internship.description}</p>
                                    </div>
                                )) : <p className="text-sm text-text-secondary">No internship experience listed.</p>}
                            </div>
                        </ProfileSection>

                         {/* Achievements Section */}
                        <ProfileSection title="Achievements & Certifications" icon={TrophyIcon}>
                            <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                                {student.achievements?.length > 0 ? student.achievements.map((ach, index) => (
                                    <li key={index}>{ach}</li>
                                )) : <p>No achievements listed.</p>}
                            </ul>
                        </ProfileSection>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default AdminStudentProfileModal;