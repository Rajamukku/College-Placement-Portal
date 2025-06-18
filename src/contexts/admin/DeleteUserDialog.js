import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';
import { useUsers } from '../../contexts/UserContext'; // Import useUsers to get access to fetchUsers

const DeleteUserDialog = ({ open, onClose, user }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchUsers } = useUsers(); // Get the function to refresh the user list

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5001/api/users/${user._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || 'Failed to delete user.');
        }

        // --- THE FIX ---
        // After a successful deletion, re-fetch the user list from the backend.
        // This will cause the ManageUsers page to re-render with the updated list.
        fetchUsers(); 
        
        onClose(); // Close the dialog
        
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography>
          Are you sure you want to delete the user <strong>{user.name}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDelete} variant="contained" color="error" disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserDialog;