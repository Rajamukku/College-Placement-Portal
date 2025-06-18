import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';
import { useUsers } from '../../contexts/UserContext';

const UpdateUserDialog = ({ open, onClose, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const { updateUserPassword } = useUsers(); // Assume this exists in context

  useEffect(() => {
    if (open) {
      setNewPassword('');
      setError('');
    }
  }, [open]);

  const handleSave = () => {
    if (!newPassword) {
      setError('Password cannot be empty.');
      return;
    }
    // updateUserPassword(user.id, newPassword);
    console.log("Updating password for user (mock):", user.id);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Password for {user.name}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus margin="dense" id="password" label="New Password"
          type="password" fullWidth variant="outlined"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUserDialog;