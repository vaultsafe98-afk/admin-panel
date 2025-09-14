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
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Block,
  CheckCircle,
  Refresh,
  LockReset,
  Visibility,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  depositAmount: number;
  profitAmount: number;
  totalAmount: number;
  status: 'active' | 'blocked';
  role: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<'block' | 'unblock' | 'reset' | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(page + 1, rowsPerPage, searchTerm);
      setUsers((response.data as any).users);
      setTotalUsers((response.data as any).pagination.totalItems);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUserAction = async (action: 'block' | 'unblock' | 'reset') => {
    if (!selectedUser) return;

    try {
      if (action === 'block') {
        await adminApi.blockUser(selectedUser.id);
        setSnackbar({ open: true, message: 'User blocked successfully', severity: 'success' });
      } else if (action === 'unblock') {
        await adminApi.unblockUser(selectedUser.id);
        setSnackbar({ open: true, message: 'User unblocked successfully', severity: 'success' });
      } else if (action === 'reset') {
        const response = await adminApi.resetUserPassword(selectedUser.id);
        setSnackbar({ 
          open: true, 
          message: `Password reset successfully. New password: ${(response.data as any).newPassword}`, 
          severity: 'success' 
        });
      }
      
      setActionDialog(null);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(`Failed to ${action} user:`, err);
      setSnackbar({ open: true, message: `Failed to ${action} user`, severity: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 4 }}>
        Users Management
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
              Users ({totalUsers})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              disabled={loading}
              sx={{ color: '#00ff88', borderColor: '#00ff88' }}
            >
              Refresh
            </Button>
          </Box>
          
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#00ff88' }} />
                </InputAdornment>
              ),
            }}
            sx={{
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
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Deposit</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Profit</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Joined</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell sx={{ color: 'white' }}>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatCurrency(user.depositAmount)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatCurrency(user.profitAmount)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatCurrency(user.totalAmount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" sx={{ color: '#00ff88' }}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {user.status === 'active' ? (
                        <Tooltip title="Block User">
                          <IconButton
                            size="small"
                            sx={{ color: '#ff4444' }}
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog('block');
                            }}
                          >
                            <Block />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Unblock User">
                          <IconButton
                            size="small"
                            sx={{ color: '#00ff88' }}
                            onClick={() => {
                              setSelectedUser(user);
                              setActionDialog('unblock');
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Reset Password">
                        <IconButton
                          size="small"
                          sx={{ color: '#ffaa00' }}
                          onClick={() => {
                            setSelectedUser(user);
                            setActionDialog('reset');
                          }}
                        >
                          <LockReset />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
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

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog !== null}
        onClose={() => setActionDialog(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#00ff88' }}>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'white' }}>
            Are you sure you want to {actionDialog} user {selectedUser?.firstName} {selectedUser?.lastName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActionDialog(null)}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUserAction(actionDialog!)}
            variant="contained"
            sx={{
              backgroundColor: actionDialog === 'block' ? '#ff4444' : '#00ff88',
              '&:hover': {
                backgroundColor: actionDialog === 'block' ? '#ff6666' : '#00ffaa',
              },
            }}
          >
            Confirm
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

export default UsersPage;
