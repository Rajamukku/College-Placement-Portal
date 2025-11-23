import React, { useEffect, useState } from 'react';
import Header from '../../components/common/Header';
import CompanyCard from '../../components/student/CompanyCard';
import axios from 'axios';
import toast from 'react-hot-toast';

const BrowseCompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:5000/api/companies');
                setCompanies(res.data?.companies || []);
            } catch (e) {
                toast.error('Failed to load companies');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header userType="student" />
            <main className="max-w-7xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Registered Companies</h1>
                <p className="text-md text-text-secondary mb-8">Learn more about the companies recruiting from our university.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center text-text-secondary">Loading companies...</div>
                    ) : companies.length ? (
                        companies.map(company => (
                            <CompanyCard key={company._id} company={{ id: company._id, name: company.name, industry: company.industry, pastHires: 0, logoUrl: company.logoUrl }} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-text_secondary">No companies found.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BrowseCompaniesPage;