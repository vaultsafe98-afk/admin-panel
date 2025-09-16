import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  ListItemAvatar,
} from '@mui/material';
import SafeVaultLogo from './SafeVaultLogo';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  PendingActions,
  AccountBalance,
  TrendingUp,
  Notifications,
  Settings,
  Logout,
  Person,
} from '@mui/icons-material';
import { adminApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Pending Users', icon: <PendingActions />, path: '/pending-users' },
    { text: 'Deposits', icon: <AccountBalance />, path: '/deposits' },
    { text: 'Withdrawals', icon: <TrendingUp />, path: '/withdrawals' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const fetchNotifications = async () => {
    try {
      const response = await adminApi.getNotifications(1, 10);
      const notificationData = (response.data as any).notifications || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n: any) => n.status === 'unread').length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark notification as read
    if (notification.status === 'unread') {
      try {
        await adminApi.markNotificationAsRead(notification.id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, status: 'read' }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Navigate to appropriate page based on notification type
    if (notification.type === 'deposit') {
      navigate('/deposits');
    } else if (notification.type === 'withdrawal') {
      navigate('/withdrawals');
    } else {
      navigate('/notifications');
    }
    
    handleNotificationMenuClose();
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const drawer = (
    <Box>
      <Toolbar>
        <SafeVaultLogo size="medium" showText={true} sx={{ width: '100%' }} />
      </Toolbar>
      <Toolbar sx={{ minHeight: '16px !important' }}>
        <Typography
          variant="body2"
          sx={{
            color: '#888',
            fontSize: '0.875rem',
            textAlign: 'center',
            width: '100%',
          }}
        >
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  borderRight: '3px solid #00ff88',
                  '& .MuiListItemIcon-root': {
                    color: '#00ff88',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#00ff88',
                    fontWeight: 'bold',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? '#00ff88' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="notifications"
              aria-controls="notification-menu"
              aria-haspopup="true"
              onClick={handleNotificationMenuOpen}
              color="inherit"
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: '#00ff88', color: '#000' }}>
                <Person />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={user?.email} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
            
            {/* Notification Menu */}
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  width: 350,
                  maxHeight: 400,
                  backgroundColor: 'rgba(26, 26, 26, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                }
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 255, 136, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: '#00ff88', fontWeight: 'bold' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <IconButton
                    size="small"
                    onClick={async () => {
                      try {
                        await adminApi.markAllNotificationsAsRead();
                        setNotifications(prev => 
                          prev.map(n => ({ ...n, status: 'read' }))
                        );
                        setUnreadCount(0);
                      } catch (error) {
                        console.error('Failed to mark all notifications as read:', error);
                      }
                    }}
                    sx={{ color: '#00ff88' }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      Mark all read
                    </Typography>
                  </IconButton>
                )}
              </Box>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      disablePadding
                    >
                      <ListItemButton
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          },
                        }}
                      >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: notification.status === 'unread' ? '#00ff88' : 'rgba(255, 255, 255, 0.3)',
                          color: notification.status === 'unread' ? '#000' : '#fff',
                          width: 32,
                          height: 32,
                        }}>
                          {notification.type === 'deposit' ? '💰' : notification.type === 'withdrawal' ? '💸' : '🔔'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              color: notification.status === 'unread' ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                              fontWeight: notification.status === 'unread' ? 'bold' : 'normal',
                              fontSize: '0.9rem',
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                            {notification.user?.name} • {new Date(notification.createdAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid rgba(0, 255, 136, 0.2)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid rgba(0, 255, 136, 0.2)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
