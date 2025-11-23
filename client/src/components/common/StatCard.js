import React from 'react';

const StatCard = ({ title, value, Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-pu-light-blue p-3 rounded-full">
            <Icon className="h-8 w-8 text-pu-blue" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-pu-blue">{value}</p>
        </div>
    </div>
);

export default StatCard;