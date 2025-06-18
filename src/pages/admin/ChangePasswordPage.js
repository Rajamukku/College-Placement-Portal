import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Container,
  IconButton,
  InputAdornment // --- 1. Import icon components
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // --- 2. Import the icons
import { useUsers } from '../../contexts/UserContext';

const ChangePasswordPage = () => {
  const { API_URL } = useUsers();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 3. Add state to control visibility for each password field ---
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { currentPassword, newPassword, confirmPassword } = passwords;

  const handleChange = e => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }
    if (newPassword.length < 6) {
        return setError('New password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || 'Failed to update password.');
        }

        setSuccess(data.msg);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Change Admin Password</Typography>
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            {/* --- 4. Update the Current Password TextField --- */}
            <TextField
                fullWidth
                margin="normal"
                required
                name="currentPassword"
                label="Current Password"
                value={currentPassword}
                onChange={handleChange}
                type={showCurrentPassword ? 'text' : 'password'}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />

            {/* --- 5. Update the New Password TextField --- */}
            <TextField
                fullWidth
                margin="normal"
                required
                name="newPassword"
                label="New Password"
                value={newPassword}
                onChange={handleChange}
                type={showNewPassword ? 'text' : 'password'}
                InputProps={{
                    endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    ),
                }}
            />

            <TextField 
                fullWidth 
                margin="normal" 
                required
                name="confirmPassword" 
                label="Confirm New Password" 
                value={confirmPassword} 
                onChange={handleChange} 
                type={showNewPassword ? 'text' : 'password'} // This field should match the visibility of the new password field
            />
            
            <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
            </Button>
        </Box>
        </Paper>
    </Container>
  );
};

export default ChangePasswordPage;