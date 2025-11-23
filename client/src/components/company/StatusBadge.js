import React from 'react';
const StatusBadge = ({ status }) => {
    const styles = { 'Live': 'bg-success/10 text-success', 'Closed': 'bg-danger/10 text-danger', 'applied': 'bg-info/10 text-info', 'shortlisted': 'bg-warning/10 text-warning', 'interview': 'bg-accent/10 text-accent', 'hired': 'bg-success/10 text-success', 'rejected': 'bg-danger/10 text-danger', 'default': 'bg-gray-100 text-gray-800' };
    const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles['default']}`}>{formattedStatus}</span>;
};
export default StatusBadge;