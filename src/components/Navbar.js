import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../assets/parul-logo.png';

const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Companies', path: '/companies' },
    { name: 'My Applications', path: '/applications' },
    { name: 'About', path: '/about' },
];

const Navbar = ({ onLogout }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogoutClick = () => {
    handleCloseUserMenu();
    onLogout();
  };
  
  const userName = "Alex Doe";
  const userAvatar = "A";

  return (
    <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#000' }} elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '1rem' }}/>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Placement Portal
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {navItems.map((item) => (
            <Button key={item.name} component={RouterLink} to={item.path} sx={{ color: '#333', textTransform: 'none', fontWeight: 500 }}>
              {item.name}
            </Button>
          ))}
        </Box>
        <Box sx={{ flexGrow: 0, ml: 3 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }} alt={userName}>{userAvatar}</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle1" component="div">Hi, {userName}</Typography>
            </Box>
            <MenuItem onClick={handleCloseUserMenu}>
              <Typography textAlign="center">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;