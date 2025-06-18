import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import LOGO_URL from '../assets/parul-logo.png';
import { useUsers } from '../contexts/UserContext';

const ForgotPasswordPage = () => {
  const { API_URL } = useUsers();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Manages which form to show
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: User submits their email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Error sending OTP.');
      setSuccess(data.msg);
      setStep(2); // Move to OTP step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User submits the OTP they received
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Error verifying OTP.');
      setSuccess(data.msg);
      setStep(3); // Move to New Password step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: User submits their new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Error resetting password.');
      setSuccess(data.msg + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Conditionally render the correct form based on the current step
  const renderStep = () => {
    switch (step) {
      case 1: // Enter Email
        return (
          <Box component="form" onSubmit={handleSendOtp}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Enter the email address associated with your account.
            </Typography>
            <TextField fullWidth margin="normal" required label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </Box>
        );
      case 2: // Enter OTP
        return (
          <Box component="form" onSubmit={handleVerifyOtp}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Enter the 4-digit OTP sent to {email}. 
              <Button size="small" onClick={() => setStep(1)}>(Change Email)</Button>
            </Typography>
            <TextField fullWidth margin="normal" required label="4-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
          </Box>
        );
      case 3: // Reset Password
        return (
          <Box component="form" onSubmit={handleResetPassword}>
             <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Create a new password for {email}.
            </Typography>
            <TextField fullWidth margin="normal" required label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus />
            <TextField fullWidth margin="normal" required label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
             {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', height: '90vh' }}>
      <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <img src={LOGO_URL} alt="Logo" style={{ width: '200px', marginBottom: '1rem' }} />
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Reset Your Password
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        {renderStep()}
        <Button component={RouterLink} to="/login" sx={{ mt: 2 }}>
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;