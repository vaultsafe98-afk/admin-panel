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
  AccountBalance,
  Edit,
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
  trcAddress?: string;
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
  const [actionDialog, setActionDialog] = useState<'block' | 'unblock' | 'reset' | 'balance' | 'editTrc' | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [balanceAdjustment, setBalanceAdjustment] = useState({ newBalance: '', reason: '' });
  const [trcAddressData, setTrcAddressData] = useState({ trcAddress: '' });

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

  const handleBalanceAdjustment = async () => {
    if (!selectedUser || !balanceAdjustment.newBalance || !balanceAdjustment.reason) return;

    try {
      const newBalance = parseFloat(balanceAdjustment.newBalance);
      if (isNaN(newBalance) || newBalance < 0) {
        setSnackbar({ open: true, message: 'Please enter a valid balance amount', severity: 'error' });
        return;
      }

      const response = await adminApi.adjustUserBalance(selectedUser.id, newBalance, balanceAdjustment.reason);
      const data = response.data as any;
      
      setSnackbar({ 
        open: true, 
        message: `Balance adjusted successfully. Change: $${data.user.balanceChange.toFixed(2)}`, 
        severity: 'success' 
      });
      
      setActionDialog(null);
      setSelectedUser(null);
      setBalanceAdjustment({ newBalance: '', reason: '' });
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to adjust user balance:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Failed to adjust user balance', 
        severity: 'error' 
      });
    }
  };

  const handleTrcAddressUpdate = async () => {
    if (!selectedUser || !trcAddressData.trcAddress) return;

    try {
      // Validate TRC address format
      if (!trcAddressData.trcAddress.startsWith('T') || trcAddressData.trcAddress.length !== 34) {
        setSnackbar({ open: true, message: 'Invalid TRC address format. Must start with T and be 34 characters long', severity: 'error' });
        return;
      }

      // Call API to update TRC address
      const response = await adminApi.updateUserTrcAddress(selectedUser.id, trcAddressData.trcAddress);
      const data = response.data as any;
      
      setSnackbar({ 
        open: true, 
        message: `TRC Address updated successfully: ${data.user.trcAddress}`, 
        severity: 'success' 
      });
      
      setActionDialog(null);
      setSelectedUser(null);
      setTrcAddressData({ trcAddress: '' });
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to update TRC address:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update TRC address', severity: 'error' });
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
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Balance</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>TRC Address</TableCell>
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
                  <TableCell sx={{ color: 'white' }}>{formatCurrency(user.totalAmount)}</TableCell>
                  <TableCell sx={{ color: 'white', maxWidth: 200 }}>
                    {user.trcAddress ? (
                      <Box sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                        color: '#00ff88'
                      }}>
                        {user.trcAddress}
                      </Box>
                    ) : (
                      <Box sx={{ color: '#666', fontStyle: 'italic' }}>
                        Not assigned
                      </Box>
                    )}
                  </TableCell>
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
                      
                      <Tooltip title="Adjust Balance">
                        <IconButton
                          size="small"
                          sx={{ color: '#9370db' }}
                          onClick={() => {
                            setSelectedUser(user);
                            setBalanceAdjustment({ newBalance: user.depositAmount.toString(), reason: '' });
                            setActionDialog('balance');
                          }}
                        >
                          <AccountBalance />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit TRC Address">
                        <IconButton
                          size="small"
                          sx={{ color: '#00ff88' }}
                          onClick={() => {
                            setSelectedUser(user);
                            setTrcAddressData({ trcAddress: user.trcAddress || '' });
                            setActionDialog('editTrc');
                          }}
                        >
                          <Edit />
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
          {actionDialog === 'balance' ? 'Adjust User Balance' : 
           actionDialog === 'editTrc' ? 'Edit TRC Address' : 'Confirm Action'}
        </DialogTitle>
        <DialogContent>
          {actionDialog === 'balance' ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: 'white', mb: 2 }}>
                Adjust balance for {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <Typography sx={{ color: '#ccc', mb: 2, fontSize: '0.9rem' }}>
                Current Balance: {formatCurrency(selectedUser?.depositAmount || 0)}
              </Typography>
              <TextField
                fullWidth
                label="New Balance"
                type="number"
                value={balanceAdjustment.newBalance}
                onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, newBalance: e.target.value })}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#00ff88' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ color: '#ccc' }}>$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Reason for Adjustment"
                multiline
                rows={3}
                value={balanceAdjustment.reason}
                onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, reason: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#00ff88' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' },
                }}
              />
            </Box>
          ) : actionDialog === 'editTrc' ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: 'white', mb: 2 }}>
                Edit TRC Address for {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <Typography sx={{ color: '#ccc', mb: 2, fontSize: '0.9rem' }}>
                Email: {selectedUser?.email}
              </Typography>
              <Typography sx={{ color: '#ccc', mb: 2, fontSize: '0.9rem' }}>
                Current TRC Address: {selectedUser?.trcAddress || 'Not assigned'}
              </Typography>
              <TextField
                fullWidth
                label="New TRC Address (USDT Deposit Address)"
                value={trcAddressData.trcAddress}
                onChange={(e) => setTrcAddressData({ ...trcAddressData, trcAddress: e.target.value })}
                placeholder="TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#00ff88' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' },
                }}
                helperText="Enter a TRC-20 address for this user's USDT deposits"
                FormHelperTextProps={{ sx: { color: '#999' } }}
              />
            </Box>
          ) : (
            <Typography sx={{ color: 'white' }}>
              Are you sure you want to {actionDialog} user {selectedUser?.firstName} {selectedUser?.lastName}?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActionDialog(null);
              setBalanceAdjustment({ newBalance: '', reason: '' });
              setTrcAddressData({ trcAddress: '' });
            }}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (actionDialog === 'balance') {
                handleBalanceAdjustment();
              } else if (actionDialog === 'editTrc') {
                handleTrcAddressUpdate();
              } else {
                handleUserAction(actionDialog!);
              }
            }}
            variant="contained"
            disabled={
              (actionDialog === 'balance' && (!balanceAdjustment.newBalance || !balanceAdjustment.reason)) ||
              (actionDialog === 'editTrc' && !trcAddressData.trcAddress)
            }
            sx={{
              backgroundColor: actionDialog === 'block' ? '#ff4444' : '#00ff88',
              '&:hover': {
                backgroundColor: actionDialog === 'block' ? '#ff6666' : '#00ffaa',
              },
              '&:disabled': {
                backgroundColor: '#555',
                color: '#999',
              },
            }}
          >
            {actionDialog === 'balance' ? 'Adjust Balance' : 
             actionDialog === 'editTrc' ? 'Update TRC Address' : 'Confirm'}
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
