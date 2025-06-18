import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUsers } from '../../contexts/UserContext';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box sx={{ color: color, fontSize: 48 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
    const { API_URL } = useUsers();
    // Use local state for dashboard-specific data
    const [stats, setStats] = useState({ students: 0, companies: 0, openJobs: 0, placed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('authToken');
            try {
                setLoading(true);
                // We'll fetch all data needed for the dashboard.
                // In a real large-scale app, you might have a dedicated `/api/dashboard/stats` endpoint.
                const [usersRes, companiesRes, jobsRes, appsRes] = await Promise.all([
                    fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/companies`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    // This is a placeholder for getting all applications. We need to create this route.
                    // For now, we'll mock the 'placed' count.
                    // fetch(`${API_URL}/applications`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const usersData = await usersRes.json();
                const companiesData = await companiesRes.json();
                const jobsData = await jobsRes.json();
                // const appsData = await appsRes.json();

                if (!usersRes.ok || !companiesRes.ok || !jobsRes.ok) {
                    throw new Error("Failed to fetch dashboard data.");
                }

                // const placedCount = new Set(appsData.filter(a => a.status === 'Hired').map(a => a.student)).size;

                setStats({
                    students: usersData.length,
                    companies: companiesData.length,
                    openJobs: jobsData.filter(j => j.status === 'Open').length,
                    placed: 0, // Mocked for now until we have an endpoint for all applications
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [API_URL]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
            <Grid container spacing={3}>
                <Grid item lg={3} sm={6} xs={12}>
                    <StatCard title="Total Students" value={stats.students} icon={<SchoolIcon />} color="primary.main" />
                </Grid>
                <Grid item lg={3} sm={6} xs={12}>
                    <StatCard title="Companies Onboard" value={stats.companies} icon={<BusinessIcon />} color="warning.main" />
                </Grid>
                <Grid item lg={3} sm={6} xs={12}>
                    <StatCard title="Open Jobs" value={stats.openJobs} icon={<WorkIcon />} color="info.main" />
                </Grid>
                <Grid item lg={3} sm={6} xs={12}>
                    <StatCard title="Students Placed" value={stats.placed} icon={<CheckCircleIcon />} color="success.main" />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;