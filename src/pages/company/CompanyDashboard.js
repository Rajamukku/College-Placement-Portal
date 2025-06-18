import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext';

const CompanyDashboard = () => {
  const { authenticatedUser, API_URL } = useUsers();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Don't fetch data until we know who the authenticated user is
    if (!authenticatedUser?._id) {
        setLoading(false);
        return;
    }
    
    const fetchCompanyJobs = async () => {
        const token = localStorage.getItem('authToken');
        setLoading(true);
        setError('');
        try {
            // Fetch this specific company's jobs using their ID
            const response = await fetch(`${API_URL}/jobs/company/${authenticatedUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || "Could not fetch this company's jobs.");
            }
            setJobs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchCompanyJobs();
  }, [authenticatedUser, API_URL]);
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {authenticatedUser?.name}</Typography>
      <Typography variant="h6" gutterBottom>Your Posted Jobs</Typography>
      
      <Grid container spacing={3}>
        {jobs.length > 0 ? jobs.map(job => (
          <Grid item xs={12} md={6} lg={4} key={job._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">{job.title}</Typography>
                <Chip label={job.status} color={job.status === 'Open' ? 'success' : 'default'} sx={{ my: 1 }} />
                <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                  Posted on: {new Date(job.postedOn).toLocaleDateString()}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={RouterLink} 
                  to={`/company/jobs/${job._id}/applicants`} 
                  variant="contained" 
                  fullWidth
                >
                  View Applicants
                </Button>
              </Box>
            </Card>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Typography>You have not posted any jobs yet.</Typography>
            <Button component={RouterLink} to="/company/post-job" variant="contained" sx={{ mt: 2 }}>
                Post Your First Job
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CompanyDashboard;