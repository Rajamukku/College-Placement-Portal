import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Alert, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useUsers } from '../../contexts/UserContext';

const ResetCompanyPasswordDialog = ({ open, onClose, company }) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { API_URL } = useUsers();

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/companies/${company._id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to reset password.');
      
      setSuccess(data.msg);
      setNewPassword('');
      setTimeout(() => { // Close the dialog after a short delay
          onClose();
          setSuccess(''); // Reset success message for next time
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!company) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Reset Password for {company.name}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          name="newPassword"
          label="New Password"
          fullWidth
          variant="outlined"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleReset} variant="contained" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetCompanyPasswordDialog;