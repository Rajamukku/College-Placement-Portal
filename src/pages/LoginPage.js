import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import LOGO_URL from '../assets/parul-logo.png';
import CAMPUS_IMG_URL from '../assets/parul-gate.jpg';

const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'An error occurred.');
      }
      onLogin(data.role, data.username, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid
        item xs={false} sm={4} md={7}
        sx={{ backgroundImage: `url(${CAMPUS_IMG_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <img src={LOGO_URL} alt="Parul University Logo" style={{ width: '250px', marginBottom: '1rem' }} />
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <FormControl component="fieldset" required>
              <FormLabel component="legend">* Role</FormLabel>
              <RadioGroup row aria-label="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <FormControlLabel value="admin" control={<Radio />} label="Admin" />
                <FormControlLabel value="student" control={<Radio />} label="Student" />
                <FormControlLabel value="company" control={<Radio />} label="Company" />
              </RadioGroup>
            </FormControl>
            <TextField
              margin="normal" required fullWidth id="username"
              label="Username"
              name="username" autoComplete="username" autoFocus
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Password"
              id="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
            <Grid container>
                <Grid item>
                     <RouterLink to="/forgot-password" variant="body2">
                        Forgot password?
                    </RouterLink>
                </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;