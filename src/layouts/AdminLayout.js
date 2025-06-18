import React, { useEffect } from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Button, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LockResetIcon from '@mui/icons-material/LockReset';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUsers } from '../contexts/UserContext';
import LOGO_URL from '../assets/parul-logo.png';

const drawerWidth = 240;

const AdminLayout = ({ onLogout }) => {
  const { users, fetchUsers } = useUsers();

  // Fetch the user list if it's empty, so we have a valid ID for the link
  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users.length, fetchUsers]);

  // Use the _id of the first student in the list for the "quick view" link.
  const firstStudentId = users.length > 0 ? users[0]._id : 'no-students';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Manage Students', icon: <PeopleIcon />, path: '/admin/students' },
    { text: 'Manage Companies', icon: <BusinessIcon />, path: '/admin/companies' },
    { text: 'Manage Jobs', icon: <WorkIcon />, path: '/admin/jobs' },
  ];

  const studentViewItems = [
    { text: 'Student Portal View', icon: <SchoolIcon />, path: `/admin/view-as/${firstStudentId}/dashboard` }
  ];

  const settingsItems = [
    { text: 'My Profile', icon: <AccountCircleIcon />, path: '/admin/settings' },
    { text: 'Change Password', icon: <LockResetIcon />, path: '/admin/change-password' },
  ];

  // --- THIS IS THE FULL, CORRECTED DRAWER JSX ---
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {studentViewItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton disabled={users.length === 0}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {settingsItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box component="img" sx={{ height: 40, mr: 2 }} alt="Parul University Logo" src={LOGO_URL} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <Button color="inherit" onClick={onLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;