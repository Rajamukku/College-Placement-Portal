import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Container,
  CircularProgress
} from '@mui/material';
import { useUsers } from '../../contexts/UserContext';

const AdminProfilePage = () => {
  const { API_URL, authenticatedUser } = useUsers();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // When the component loads, pre-populate the form with the admin's current data
  useEffect(() => {
    if (authenticatedUser) {
      setFormData({
        name: authenticatedUser.name || '',
        email: authenticatedUser.email || ''
      });
    }
  }, [authenticatedUser]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/users/admin/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || 'Failed to update profile.');
        }

        setSuccess('Profile updated successfully!');
        // Note: You might want to update the authenticatedUser in the context here as well
        // for a more seamless experience, but for now, a success message is good.

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Profile</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Update your name and email address here.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            <TextField 
              fullWidth 
              margin="normal" 
              name="name" 
              label="Full Name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            <TextField 
              fullWidth 
              margin="normal" 
              type="email" 
              name="email" 
              label="Email Address" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            
            <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminProfilePage;