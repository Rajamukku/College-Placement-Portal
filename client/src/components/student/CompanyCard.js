import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

const CompanyCard = ({ company }) => {
    return (
        <div className="bg-surface rounded-lg shadow-card hover:shadow-card-hover p-6 flex flex-col items-center text-center transition-all duration-300 group">
            <img 
                src={company.logoUrl || `https://via.placeholder.com/100?text=${company.name.charAt(0)}`} 
                alt={`${company.name} Logo`}
                className="h-20 w-20 rounded-full object-contain mb-4 border-2 border-gray-200"
            />
            <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">{company.name}</h3>
            <p className="text-sm text-text-secondary mt-1">{company.industry}</p>
            
            <div className="my-4 w-full border-t border-gray-200"></div>

            <div className="flex items-center text-text-secondary text-sm">
                <BuildingOffice2Icon className="h-5 w-5 mr-2 text-accent"/>
                Hired {company.pastHires}+ students
            </div>

            <div className="mt-auto pt-6 w-full">
                <Link to={`/student/company/${company.id}`} className="block w-full bg-primary text-white font-bold py-2.5 px-4 rounded-md hover:bg-opacity-90 transition-all duration-300 transform group-hover:scale-105">
                    View Profile
                </Link>
            </div>
        </div>
    );
};

export default CompanyCard;