import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ViewColumn as ViewColumnIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
  { id: 'columns', label: 'Column Management', icon: <ViewColumnIcon /> },
];

export default function Layout({ children, currentTab, onTabChange, onLogout }: LayoutProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
            CRM Admin Panel
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
              admin@crm.com
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid #E0E0E0',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #E0E0E0', bgcolor: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
            CRM Admin
          </Typography>
        </Box>
        
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ px: 2, mb: 1 }}>
              <ListItemButton
                onClick={() => onTabChange(item.id)}
                selected={currentTab === item.id}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'primary.light',
                    opacity: 0.8,
                  },
                }}
              >
                <ListItemIcon sx={{ color: currentTab === item.id ? 'white' : 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          mt: 8,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}