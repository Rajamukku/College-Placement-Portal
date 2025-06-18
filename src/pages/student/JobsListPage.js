import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useUsers } from '../../contexts/UserContext';

const JobsListPage = () => {
    const { authenticatedUser, API_URL } = useUsers();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobsAndApplications = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError("Authorization Error. Please log in.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                
                // Fetch both open jobs and the student's existing applications concurrently
                const [jobsRes, appsRes] = await Promise.all([
                    fetch(`${API_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    
                    // --- THIS IS THE FIX: Changed API_ to API_URL ---
                    fetch(`${API_URL}/applications/student`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const jobsData = await jobsRes.json();
                const appsData = await appsRes.json();

                if (!jobsRes.ok || !appsRes.ok) {
                    throw new Error("Failed to load job data.");
                }

                setJobs(jobsData);
                setApplications(appsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobsAndApplications();
    }, [API_URL]);

    // This helper checks if the student has already applied for a specific job
    const hasApplied = (jobId) => {
        return applications.some(app => app.job === jobId);
    };

    const handleApply = async (jobId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ jobId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || "Failed to apply.");
            
            // Add the new application to the local state to instantly disable the button
            setApplications(prev => [...prev, { job: jobId, ...data }]);
            alert("Application successful!");

        } catch (err) {
            alert(err.message);
        }
    };
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Available Job Postings</Typography>
            <Grid container spacing={3}>
                {jobs.length > 0 ? jobs.map(job => (
                    <Grid item xs={12} md={6} lg={4} key={job._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div">{job.title}</Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">{job.company?.name}</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>{job.description}</Typography>
                                <Typography variant="subtitle2">
                                    <strong>Skills:</strong> {job.requiredSkills.join(', ')}
                                </Typography>
                            </CardContent>
                            <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => handleApply(job._id)}
                                    disabled={hasApplied(job._id)}
                                >
                                    {hasApplied(job._id) ? 'Applied' : 'Apply Now'}
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Typography>No open jobs at the moment. Please check back later.</Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default JobsListPage;