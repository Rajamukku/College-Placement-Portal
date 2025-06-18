import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useUsers } from '../../contexts/UserContext';

const CreateResumePage = () => {
  const { authenticatedUser, API_URL } = useUsers();
  const [resumeData, setResumeData] = useState({
    summary: '',
    experience: '',
    education: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // When the component loads, pre-populate the form with the authenticated user's data
  useEffect(() => {
    if (authenticatedUser) {
      setResumeData({
        summary: authenticatedUser.summary || '',
        experience: authenticatedUser.experience || '',
        education: authenticatedUser.education || '',
      });
      setLoading(false);
    }
  }, [authenticatedUser]);

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  // This function is called when the user clicks the "Save Profile" button
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      // Make a PATCH request to the backend to update the resume data
      const response = await fetch(`${API_URL}/users/resume`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to save resume.');
      }

      setSuccess('Resume data saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !authenticatedUser) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ my: 4, p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          My Profile & Resume
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Update your profile information below. This will be visible to companies when you apply for jobs.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={handleSave} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField 
                name="summary" 
                label="Professional Summary / Objective" 
                value={resumeData.summary} 
                onChange={handleChange} 
                required 
                fullWidth 
                multiline 
                rows={4} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="experience" 
                label="Work Experience" 
                placeholder="Example: Software Intern at Tech Corp (May 2023 - Aug 2023)..." 
                value={resumeData.experience} 
                onChange={handleChange} 
                fullWidth 
                multiline 
                rows={6} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                name="education" 
                label="Education" 
                placeholder="Example: B.Tech in Computer Science - Parul University (2020 - 2024)..." 
                value={resumeData.education} 
                onChange={handleChange} 
                required 
                fullWidth 
                multiline 
                rows={4} 
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateResumePage;