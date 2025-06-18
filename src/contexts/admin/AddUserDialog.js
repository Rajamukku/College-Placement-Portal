import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Alert, Grid
} from '@mui/material';
import { useUsers } from '../UserContext';

const AddUserDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addUser } = useUsers(); // Get the function from context to update the UI

  // Function to handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle the "Create Student" button click
  const handleAdd = async () => {
    if (!formData.name || !formData.username || !formData.password || !formData.email) {
      setError('Name, Username, Email, and Password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken'); // Get admin's token for authorization
      
      // Make the API call to the backend endpoint
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Prove that an admin is making this request
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // If the backend returns an error (e.g., "User already exists")
        throw new Error(data.msg || 'Failed to create user');
      }

      // --- On Success ---
      // 1. Add the new user to the local state so the table updates instantly
      addUser(data);
      
      // 2. Close the dialog
      onClose();
      
      // 3. Reset the form for the next time
      setFormData({ name: '', username: '', email: '', phone: '', password: '' });

    } catch (err) {
      // Display the error message from the backend in the dialog
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Student Account</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                <TextField name="name" required fullWidth label="Full Name" value={formData.name} onChange={handleChange} autoFocus />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField name="username" required fullWidth label="Username" value={formData.username} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField name="phone" fullWidth label="Phone Number" value={formData.phone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <TextField name="email" type="email" required fullWidth label="Email Address" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
                <TextField name="password" type="password" required fullWidth label="Password" value={formData.password} onChange={handleChange} />
            </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Student'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;