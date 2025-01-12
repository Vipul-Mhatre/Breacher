import React from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as LogsIcon,
  NotificationImportant as AlertsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
  },
}));

const StyledMain = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const StyledToolbarSpacer = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Logs', icon: <LogsIcon />, path: '/logs' },
  { text: 'Alerts', icon: <AlertsIcon />, path: '/alerts' },
  { 
    text: 'User Management', 
    icon: <PeopleIcon />, 
    path: '/users',
    adminOnly: true 
  },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDetailedAnalysis = () => {
    window.open('http://localhost:5001', '_blank');
  };

  return (
    <StyledRoot>
      <StyledAppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap style={{ flexGrow: 1 }}>
            AI Breach Detection System
          </Typography>
          <Button
            color="inherit"
            startIcon={<AnalyticsIcon />}
            onClick={handleDetailedAnalysis}
            style={{ marginRight: 16 }}
          >
            See Detailed Analysis
          </Button>
          <Typography variant="subtitle1" style={{ marginRight: 16 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer variant="permanent" open>
        <StyledToolbarSpacer />
        <List>
          {menuItems
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map((item) => (
              <ListItem
                button
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
        </List>
      </StyledDrawer>
      <StyledMain>
        <StyledToolbarSpacer />
        {children}
      </StyledMain>
    </StyledRoot>
  );
}

export default Layout; 