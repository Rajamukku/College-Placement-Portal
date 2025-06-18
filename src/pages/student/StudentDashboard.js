import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Paper, Table, TableContainer,
  TableHead, TableBody, TableRow, TableCell, Chip, Button, Avatar,
  CircularProgress, Alert
} from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useUsers } from '../../contexts/UserContext';

const API_URL = 'http://localhost:5001/api';

const StudentDashboard = () => {
  const { studentId } = useParams(); // For admin view
  const { authenticatedUser } = useUsers(); // To get the ID for direct login

  const [activeStudent, setActiveStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      // Determine which student ID to fetch
      const idToFetch = studentId || authenticatedUser?._id;

      if (!idToFetch) {
        setError("Could not determine student to load.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authorization error.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/users/${idToFetch}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch student data');
        }
        setActiveStudent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, authenticatedUser]); // Re-fetch if the ID changes

  // --- Render different UI based on the state ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  // This is the error message you were seeing
  if (!activeStudent) {
    return <Typography>Student profile could not be loaded. Please try logging in again.</Typography>;
  }

  // --- The main dashboard JSX ---
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Welcome, {activeStudent.name}!</Typography>
            <Typography variant="body1">
              This is your personal dashboard. Here you can track applications and find new job opportunities.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                  {activeStudent.name?.charAt(0)}
                </Avatar>
                <Typography variant="h6">{activeStudent.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary"><EmailIcon sx={{ verticalAlign: 'bottom', mr: 1 }} />{activeStudent.email}</Typography>
              <Typography variant="body2" color="text.secondary"><PhoneIcon sx={{ verticalAlign: 'bottom', mr: 1 }} />{activeStudent.phone}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;