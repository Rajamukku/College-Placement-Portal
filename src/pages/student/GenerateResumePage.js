import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Button, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';

const API_URL = 'http://localhost:5001/api';

const GenerateResumePage = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to view this page.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/users/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch student data.');
        }
        setStudent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!student) {
    return <Alert severity="warning">User not found. The ID may be incorrect.</Alert>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Student Resume</Typography>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ '@media print': { display: 'none' } }}>
          Print / Save as PDF
        </Button>
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 4, md: 6 }, maxWidth: '8.5in', mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1">{student.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{student.email} | {student.phone}</Typography>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom borderBottom={1} borderColor="grey.400" pb={1}>Professional Summary</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{student.summary || 'No summary provided.'}</Typography>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom borderBottom={1} borderColor="grey.400" pb={1}>Work Experience</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{student.experience || 'No work experience provided.'}</Typography>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box>
          <Typography variant="h5" component="h2" gutterBottom borderBottom={1} borderColor="grey.400" pb={1}>Education</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{student.education || 'No education details provided.'}</Typography>
        </Box>
      </Paper>
    </>
  );
};
export default GenerateResumePage;