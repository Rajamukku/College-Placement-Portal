import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Grid, Alert, CircularProgress } from '@mui/material';
import { useUsers } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const PostJobPage = () => {
  const { API_URL, addJob } = useUsers(); // Get addJob to update context state
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState({ title: '', description: '', requiredSkills: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDetails.title || !jobDetails.description) {
        return setError("Job Title and Description are required.");
    }
    setLoading(true);
    setError('');

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobDetails)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || "Failed to post job.");
        }

        addJob(data); // Add the new job to the global context state
        alert("Job posted successfully! Redirecting to dashboard.");
        navigate('/company/dashboard'); // Redirect to dashboard after success

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Post a New Job
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField name="title" required fullWidth label="Job Title" value={jobDetails.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="description" required fullWidth multiline rows={6} label="Job Description" value={jobDetails.description} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="requiredSkills" required fullWidth label="Required Skills (comma-separated)" value={jobDetails.requiredSkills} onChange={handleChange} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Post Job'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostJobPage;