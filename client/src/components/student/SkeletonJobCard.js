import React from 'react';

const SkeletonJobCard = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            
            <div className="flex gap-2 mb-6">
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                <div className="h-5 bg-gray-200 rounded-full w-12"></div>
            </div>

            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
    );
};

export default SkeletonJobCard;