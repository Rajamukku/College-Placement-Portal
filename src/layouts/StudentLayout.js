import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Button, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import WorkIcon from '@mui/icons-material/Work';
import { useUsers } from '../contexts/UserContext';
import LOGO_URL from '../assets/parul-logo.png';

const drawerWidth = 240;

const StudentLayout = ({ onLogout }) => {
  const { authenticatedUser } = useUsers();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Available Jobs', icon: <WorkIcon />, path: '/jobs' },
    { text: 'My Applications', icon: <ArticleIcon />, path: '/my-applications' },
    { text: 'Create/Edit Resume', icon: <DescriptionIcon />, path: '/create-resume' },
  ];

  const resumeItems = [
    // THIS IS THE FIX: Uses authenticatedUser?._id, which is the real MongoDB ID.
    // The '?' prevents errors if the user object is momentarily null during loading.
    { text: 'View & Print Resume', icon: <AssignmentIndIcon />, path: `/generate-resume/${authenticatedUser?._id}` },
  ];

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
        {resumeItems.map((item) => (
          <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemButton disabled={!authenticatedUser}>
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
            Student Placement Portal
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

export default StudentLayout;