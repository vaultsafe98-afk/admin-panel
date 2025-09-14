import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send,
  Refresh,
  Add,
  Visibility,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

interface Notification {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  message: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'general';
  status: 'read' | 'unread';
  actionUrl: string | null;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [sendDialog, setSendDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Send notification form
  const [sendForm, setSendForm] = useState({
    userId: '',
    message: '',
    type: 'general' as 'deposit' | 'withdrawal' | 'profit' | 'general',
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getNotifications(page + 1, rowsPerPage);
      setNotifications((response.data as any).notifications);
      setTotalNotifications((response.data as any).pagination.totalItems);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendNotification = async () => {
    try {
      await adminApi.sendNotification(sendForm.userId, sendForm.message, sendForm.type);
      setSnackbar({ open: true, message: 'Notification sent successfully', severity: 'success' });
      setSendDialog(false);
      setSendForm({ userId: '', message: '', type: 'general' });
      fetchNotifications();
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      setSnackbar({ open: true, message: 'Failed to send notification', severity: 'error' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'success';
      case 'withdrawal': return 'warning';
      case 'profit': return 'info';
      case 'general': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && notifications.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 4 }}>
        Notifications Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          background: 'rgba(30, 30, 30, 0.8)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ color: '#00ff88' }}>
              Notifications ({totalNotifications})
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setSendDialog(true)}
                sx={{
                  backgroundColor: '#00ff88',
                  '&:hover': { backgroundColor: '#00ffaa' },
                }}
              >
                Send Notification
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchNotifications}
                disabled={loading}
                sx={{ color: '#00ff88', borderColor: '#00ff88' }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Message</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} hover>
                  <TableCell sx={{ color: 'white' }}>
                    {notification.user ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {notification.user.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {notification.user.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        System
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'white', maxWidth: 300 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {notification.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.type}
                      color={getTypeColor(notification.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.status}
                      color={notification.status === 'read' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatDate(notification.createdAt)}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        sx={{ color: '#00ff88' }}
                        onClick={() => {
                          setSelectedNotification(notification);
                          setViewDialog(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalNotifications}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{
            color: 'white',
            '& .MuiTablePagination-toolbar': {
              color: 'white',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: 'white',
            },
          }}
        />
      </Paper>

      {/* Send Notification Dialog */}
      <Dialog
        open={sendDialog}
        onClose={() => {
          setSendDialog(false);
          setSendForm({ userId: '', message: '', type: 'general' });
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#00ff88' }}>
          Send Notification
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="User ID"
              value={sendForm.userId}
              onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#00ff88',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff88',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#00ff88',
                },
              }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#00ff88' }}>Type</InputLabel>
              <Select
                value={sendForm.type}
                onChange={(e) => setSendForm({ ...sendForm, type: e.target.value as any })}
                label="Type"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 255, 136, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00ff88',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00ff88',
                  },
                }}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
                <MenuItem value="profit">Profit</MenuItem>
              </Select>
            </FormControl>

            <TextareaAutosize
              minRows={4}
              placeholder="Enter notification message..."
              value={sendForm.message}
              onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '4px',
                color: 'white',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSendDialog(false);
              setSendForm({ userId: '', message: '', type: 'general' });
            }}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            disabled={!sendForm.userId || !sendForm.message}
            sx={{
              backgroundColor: '#00ff88',
              '&:hover': { backgroundColor: '#00ffaa' },
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setSelectedNotification(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#00ff88' }}>
          Notification Details
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>User:</strong> {selectedNotification.user ? selectedNotification.user.name : 'System'}
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Type:</strong> {selectedNotification.type}
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Status:</strong> {selectedNotification.status}
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Date:</strong> {formatDate(selectedNotification.createdAt)}
              </Typography>
              <Typography sx={{ color: 'white', mb: 1 }}>
                <strong>Message:</strong>
              </Typography>
              <Typography 
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  padding: '12px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {selectedNotification.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setViewDialog(false);
              setSelectedNotification(null);
            }}
            sx={{ color: 'white' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsPage;
