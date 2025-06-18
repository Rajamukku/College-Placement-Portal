import React, { useEffect } from 'react'; // Make sure useEffect is imported
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Autocomplete,
  TextField
} from '@mui/material';
import { useUsers } from '../contexts/UserContext';
import StudentLayout from './StudentLayout';

const ImpersonationLayout = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  // Get the users list and the function to fetch them from the context
  const { users, fetchUsers } = useUsers();

  // --- THIS IS THE FIX ---
  // This useEffect hook ensures that if the component loads and the user list
  // is empty, it will immediately call the API to fetch the list.
  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users.length, fetchUsers]); // It runs when the component mounts or if the dependencies change

  // Find the student from the now-populated (or being populated) users list
  const currentStudent = users.find(u => u._id === studentId);

  const handleExitImpersonation = () => {
    navigate('/admin/dashboard');
  };

  const handleSwitchStudent = (event, newValue) => {
    if (newValue) {
      // Navigate to the dashboard of the newly selected student
      navigate(`/admin/view-as/${newValue._id}/dashboard`);
    }
  };

  return (
    <Box>
      <AppBar position="sticky" sx={{ backgroundColor: 'error.main', color: 'white', zIndex: 1301 }}>
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>
            ADMIN VIEW: Viewing as student <strong>{currentStudent ? currentStudent.name : 'Loading...'}</strong>
          </Typography>
          <Autocomplete
            size="small"
            options={users} // The dropdown is populated from the 'users' state
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onChange={handleSwitchStudent}
            sx={{
              width: 300,
              mr: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 1,
              '& .MuiInputBase-root': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
              '& label': { color: 'white' }
            }}
            renderInput={(params) => <TextField {...params} label="Switch Student" />}
          />
          <Button color="inherit" variant="outlined" onClick={handleExitImpersonation}>
            Exit Student View
          </Button>
        </Toolbar>
      </AppBar>
      
      {/* 
        The StudentLayout is rendered below. Its nested components (like StudentDashboard)
        will now be able to find the student data because the parent ImpersonationLayout
        has ensured the 'users' list is fetched.
      */}
      <StudentLayout onLogout={() => {}} /> 
    </Box>
  );
};

export default ImpersonationLayout;