import React from 'react';
import { Outlet, Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Button, Divider, Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useUsers } from '../contexts/UserContext';
import LOGO_URL from '../assets/parul-logo.png';

const drawerWidth = 240;

const CompanyLayout = ({ onLogout }) => {
  const { authenticatedUser, companies } = useUsers();
  const { companyId } = useParams(); // For admin view

  // Determine the company to display. If admin is viewing, use params. Otherwise, use authenticated user.
  const activeCompany = companyId
    ? companies.find(c => c.id === parseInt(companyId))
    : authenticatedUser;
    
  const isAdminView = !!companyId;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: `/company/dashboard` },
    { text: 'Post New Job', icon: <AddBoxIcon />, path: `/company/post-job` },
  ];

  // If admin is viewing, adjust paths to include the companyId
  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: `/admin/view-as-company/${companyId}/dashboard` },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Avatar sx={{ width: 64, height: 64, mb: 1, bgcolor: 'primary.main' }}>
              {activeCompany?.name.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>{activeCompany?.name}</Typography>
          <Typography variant="caption">Company Portal</Typography>
      </Box>
      <Divider />
      <List>
        {(isAdminView ? adminMenuItems : menuItems).map((item) => (
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
            {isAdminView ? `Admin View: ${activeCompany?.name}` : 'Company Portal'}
          </Typography>
          {!isAdminView && (
            <Button color="inherit" onClick={onLogout}>Logout</Button>
          )}
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

export default CompanyLayout;