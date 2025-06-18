import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Select, MenuItem, FormControl, Chip,
  CircularProgress, Alert, Tooltip
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useUsers } from '../../contexts/UserContext';

// Helper function to get chip color based on status
const getStatusChipColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'shortlisted':
      return 'primary';
    case 'interview':
      return 'secondary';
    case 'applied':
      return 'info';
    case 'rejected':
      return 'error';
    case 'hired':
      return 'success';
    default:
      return 'default';
  }
};

const Applicants = ({ isAdminView = false }) => {
  const { jobId } = useParams();
  const { API_URL } = useUsers();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use useCallback to memoize the fetch function
  const fetchPageData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Authorization error.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [jobRes, applicantsRes] = await Promise.all([
        fetch(`${API_URL}/jobs/${jobId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/applications/job/${jobId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const jobData = await jobRes.json();
      const applicantsData = await applicantsRes.json();

      if (!jobRes.ok || !applicantsRes.ok) {
        throw new Error(jobData.msg || applicantsData.msg || 'Failed to fetch data.');
      }

      setJob(jobData);
      setApplicants(applicantsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId, API_URL]);

  // useEffect to call the fetch function when the component mounts
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);


  const handleStatusChange = async (appId, newStatus) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Failed to update status');
      }
      
      // Update the local state to instantly reflect the change in the UI
      setApplicants(prev => prev.map(app => (app._id === appId ? { ...app, status: newStatus } : app)));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Applicants for: {job?.title}</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Manage applications and update candidate statuses below.
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Applied On</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.length > 0 ? (
              applicants.map(app => (
                app.student && (
                  <TableRow key={app._id} hover>
                    <TableCell>{app.student.name}</TableCell>
                    <TableCell>{app.student.email}</TableCell>
                    <TableCell>{new Date(app.appliedOn).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {isAdminView ? (
                        <Chip label={app.status} color={getStatusChipColor(app.status)} size="small" />
                      ) : (
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            disabled={isAdminView}
                          >
                            <MenuItem value="Applied">Applied</MenuItem>
                            <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="Interview">Interview</MenuItem>
                            <MenuItem value="Hired">Hired</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Student's Resume">
                        <Button
                          component={RouterLink}
                          to={`/generate-resume/${app.student._id}`}
                          target="_blank" // Opens in a new tab
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                        >
                          Resume
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No applicants for this job yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Applicants;