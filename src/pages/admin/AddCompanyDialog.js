import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Alert, Grid
} from '@mui/material';
import { useUsers } from '../../contexts/UserContext';

const AddCompanyDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', username: '', password: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { API_URL } = useUsers();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    // Reset form state when closing
    setFormData({ name: '', username: '', password: '', description: '' });
    setError('');
    onClose();
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.username || !formData.password) {
      setError('Name, Username, and Password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create company');
      }
      onSuccess(data);
      handleClose(); // Use the new close handler to reset and close
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- THIS IS THE FIX: It should be open={open} ---
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Company</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField name="name" required fullWidth label="Company Name" value={formData.name} onChange={handleChange} autoFocus />
          </Grid>
          <Grid item xs={12}>
            <TextField name="username" required fullWidth label="Username" value={formData.username} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField name="password" type="password" required fullWidth label="Password" value={formData.password} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField name="description" fullWidth multiline rows={3} label="Company Description" value={formData.description} onChange={handleChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button> {/* This now works correctly */}
        <Button onClick={handleAdd} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Company'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCompanyDialog;