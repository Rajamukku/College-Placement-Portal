import React, { useState, useEffect } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Chip, Link, CircularProgress, Alert, Box
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext';

const ManageJobsPage = () => {
    const { API_URL } = useUsers();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllJobs = async () => {
            const token = localStorage.getItem('authToken');
            try {
                setLoading(true);
                // Call the new backend endpoint for admins
                const response = await fetch(`${API_URL}/jobs/all`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.msg || "Failed to fetch jobs.");
                }
                setJobs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllJobs();
    }, [API_URL]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <>
            <Typography variant="h4" gutterBottom>All Job Postings</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Job Title</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Posted On</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job._id} hover>
                                <TableCell>
                                    <Link component={RouterLink} to={`/admin/view-as-company/${job.company._id}/jobs/${job._id}/applicants`}>
                                        {job.title}
                                    </Link>
                                </TableCell>
                                <TableCell>{job.company?.name}</TableCell>
                                <TableCell>{new Date(job.postedOn).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip label={job.status} color={job.status === 'Open' ? 'success' : 'default'} size="small" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ManageJobsPage;