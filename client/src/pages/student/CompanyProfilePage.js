import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import { ArrowLeftIcon, GlobeAltIcon, UserGroupIcon, BriefcaseIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const defaultHistory = { pastHires: 0, avgPackage: '—', commonRoles: [], alumni: [] };

const CompanyProfilePage = () => {
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/companies/${companyId}`);
                if (res.data?.success) setCompany(res.data.company);
                try {
                    const jr = await axios.get(`http://localhost:5000/api/jobs/company/${companyId}`);
                    setJobs(Array.isArray(jr.data?.jobs) ? jr.data.jobs : []);
                } catch (e) {
                    setJobs([]);
                }
            } catch (e) {
                toast.error('Failed to load company');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [companyId]);

    if (loading) return <div className="min-h-screen bg-background"><Header userType="student" /><main className="max-w-5xl mx-auto py-10 px-4">Loading...</main></div>;
    if (!company) return <div className="min-h-screen bg-background"><Header userType="student" /><main className="max-w-5xl mx-auto py-10 px-4">Company not found</main></div>;

    return (
        <div className="min-h-screen bg-background">
            <Header userType="student" />
            <main className="max-w-5xl mx-auto py-10 px-4">
                <Link to="/student/companies" className="flex items-center gap-2 text-primary font-semibold hover:underline mb-6">
                    <ArrowLeftIcon className="h-5 w-5" />
                    Back to All Companies
                </Link>

                {/* --- Company Header --- */}
                <div className="bg-surface rounded-lg shadow-card p-8 flex flex-col md:flex-row items-center gap-8">
                    <img 
                        src={company.logoUrl} 
                        alt={`${company.name} Logo`}
                        className="h-28 w-28 object-contain"
                    />
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary">{company.name}</h1>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 text-accent hover:underline">
                            <GlobeAltIcon className="h-5 w-5"/>
                            Visit Website
                        </a>
                    </div>
                </div>

                {/* --- About the Company --- */}
                <div className="bg-surface rounded-lg shadow-card p-8 mt-8">
                    <h2 className="text-2xl font-bold text-primary mb-4">About {company.name}</h2>
                    <p className="text-text_secondary leading-relaxed">{company.description || 'No description available.'}</p>
                </div>

                {/* --- Open Roles --- */}
                <div className="bg-surface rounded-lg shadow-card p-8 mt-8">
                    <h2 className="text-2xl font-bold text-primary mb-4">Open Roles</h2>
                    {jobs.length === 0 ? (
                        <div className="text-text-secondary">No live openings.</div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((j, i) => (
                                <div key={i} className="border rounded p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-text-primary">{j.title}</div>
                                        <div className="text-sm text-text-secondary">Deadline: {j.deadline ? new Date(j.deadline).toLocaleDateString() : '—'}</div>
                                    </div>
                                    <div className="mt-2 text-sm text-text-secondary"><span className="font-semibold text-text-primary">Requirements:</span> {j.skills || '—'}</div>
                                    <div className="mt-1 text-sm text-text-secondary"><span className="font-semibold text-text-primary">Eligibility:</span> {j.eligibility || '—'}</div>
                                    <div className="mt-2 text-sm text-text-secondary">{j.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Placement History --- */}
                <div className="bg-surface rounded-lg shadow-card p-8 mt-8">
                    <h2 className="text-2xl font-bold text-primary mb-6">Placement History at Parul University</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Key Stats */}
                        <div className="bg-pu-light-blue p-6 rounded-lg">
                            <UserGroupIcon className="h-8 w-8 text-primary mb-2"/>
                            <p className="text-4xl font-bold text-primary">{(company.history?.pastHires || defaultHistory.pastHires)}+</p>
                            <p className="text-text-secondary font-medium">Past Hires</p>
                        </div>
                         <div className="bg-pu-light-blue p-6 rounded-lg">
                            <AcademicCapIcon className="h-8 w-8 text-primary mb-2"/>
                            <p className="text-4xl font-bold text-primary">{(company.history?.avgPackage || defaultHistory.avgPackage)}</p>
                            <p className="text-text-secondary font-medium">Average Package Offered</p>
                        </div>

                        {/* Common Roles */}
                        <div className="md:col-span-2 pt-6 border-t">
                             <h3 className="text-xl font-semibold text-text-primary mb-3 flex items-center gap-2"><BriefcaseIcon className="h-6 w-6 text-accent"/>Common Roles Offered</h3>
                             <div className="flex flex-wrap gap-3">
                                 {(company.history?.commonRoles || defaultHistory.commonRoles).map(role => (
                                     <span key={role} className="bg-gray-200 text-text-primary font-medium px-4 py-2 rounded-full">{role}</span>
                                 ))}
                             </div>
                        </div>

                         {/* Alumni */}
                        <div className="md:col-span-2 pt-6 border-t">
                             <h3 className="text-xl font-semibold text-text-primary mb-3">Alumni at {company.name}</h3>
                             <ul className="space-y-2">
                                 {(company.history?.alumni || defaultHistory.alumni).map(alumnus => (
                                     <li key={alumnus.name} className="text-text-secondary">
                                         <span className="font-semibold text-text-primary">{alumnus.name}</span> ({alumnus.batch}) - {alumnus.role}
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyProfilePage;