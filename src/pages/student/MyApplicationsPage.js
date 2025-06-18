import React from 'react';
import { 
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Typography, Box, Chip 
} from '@mui/material';
import { useUsers } from '../../contexts/UserContext';
import { useParams } from 'react-router-dom';

const getStatusChipColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'shortlisted':
    case 'interview':
      return 'primary';
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

const MyApplicationsPage = () => {
  const { users, applications, jobs, authenticatedUser } = useUsers();
  const { studentId } = useParams();

  const activeStudent = studentId 
    ? users.find(u => u.id === parseInt(studentId))
    : authenticatedUser;

  if (!activeStudent) {
    return <Typography>Application data could not be loaded.</Typography>;
  }
  
  const studentApplications = applications
    .filter(app => app.studentId === activeStudent.id)
    .map(app => ({
        ...app,
        job: jobs.find(job => job.id === app.jobId)
    }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {activeStudent.name}'s Job Applications
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="my applications table">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Date Applied</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentApplications.length > 0 ? (
              studentApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.job?.companyName}</TableCell>
                  <TableCell>{app.job?.title}</TableCell>
                  <TableCell>{app.appliedOn}</TableCell>
                  <TableCell>
                    <Chip label={app.status} color={getStatusChipColor(app.status)} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  This student has not applied to any jobs yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyApplicationsPage;