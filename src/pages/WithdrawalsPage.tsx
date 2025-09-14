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
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

interface Withdrawal {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  platform: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const WithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [processingWithdrawal, setProcessingWithdrawal] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getWithdrawals(page + 1, rowsPerPage, statusFilter);
      setWithdrawals((response.data as any).withdrawals);
      setTotalWithdrawals((response.data as any).pagination.totalItems);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch withdrawals:', err);
      setError('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleWithdrawalAction = async (action: 'approve' | 'reject') => {
    if (!selectedWithdrawal) return;

    try {
      setProcessingWithdrawal(selectedWithdrawal.id);
      
      if (action === 'approve') {
        await adminApi.approveWithdrawal(selectedWithdrawal.id, adminNotes);
        setSnackbar({ open: true, message: 'Withdrawal approved successfully', severity: 'success' });
      } else if (action === 'reject') {
        await adminApi.rejectWithdrawal(selectedWithdrawal.id, adminNotes);
        setSnackbar({ open: true, message: 'Withdrawal rejected successfully', severity: 'success' });
      }
      
      setActionDialog(null);
      setSelectedWithdrawal(null);
      setAdminNotes('');
      fetchWithdrawals();
    } catch (err: any) {
      console.error(`Failed to ${action} withdrawal:`, err);
      setSnackbar({ open: true, message: `Failed to ${action} withdrawal`, severity: 'error' });
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
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

  if (loading && withdrawals.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 4 }}>
        Withdrawals Management
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
              Withdrawals ({totalWithdrawals})
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: '#00ff88' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
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
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchWithdrawals}
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
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Platform</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Wallet Address</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id} hover>
                  <TableCell sx={{ color: 'white' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {withdrawal.user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {withdrawal.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatCurrency(withdrawal.amount)}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{withdrawal.platform}</TableCell>
                  <TableCell sx={{ color: 'white', maxWidth: 200 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }}
                    >
                      {withdrawal.walletAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={withdrawal.status}
                      color={getStatusColor(withdrawal.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatDate(withdrawal.createdAt)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          sx={{ color: '#00ff88' }}
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setActionDialog('view');
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {withdrawal.status === 'pending' && (
                        <>
                          <Tooltip title="Approve Withdrawal">
                            <IconButton
                              size="small"
                              sx={{ color: '#00ff88' }}
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setActionDialog('approve');
                              }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Withdrawal">
                            <IconButton
                              size="small"
                              sx={{ color: '#ff4444' }}
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setActionDialog('reject');
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalWithdrawals}
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

      {/* Action Dialog */}
      <Dialog
        open={actionDialog !== null}
        onClose={() => {
          setActionDialog(null);
          setSelectedWithdrawal(null);
          setAdminNotes('');
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#00ff88' }}>
          {actionDialog === 'view' ? 'View Withdrawal' : 
           actionDialog === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
        </DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Box>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>User:</strong> {selectedWithdrawal.user.name} ({selectedWithdrawal.user.email})
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Amount:</strong> {formatCurrency(selectedWithdrawal.amount)}
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Platform:</strong> {selectedWithdrawal.platform}
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Wallet Address:</strong> 
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginTop: '4px'
                  }}
                >
                  {selectedWithdrawal.walletAddress}
                </Typography>
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Date:</strong> {formatDate(selectedWithdrawal.createdAt)}
              </Typography>
              
              {selectedWithdrawal.adminNotes && (
                <Typography sx={{ color: 'white', mb: 2 }}>
                  <strong>Admin Notes:</strong> {selectedWithdrawal.adminNotes}
                </Typography>
              )}
              
              {(actionDialog === 'approve' || actionDialog === 'reject') && (
                <Box>
                  <Typography sx={{ color: 'white', mb: 1 }}>
                    <strong>Admin Notes (Optional):</strong>
                  </Typography>
                  <TextareaAutosize
                    minRows={3}
                    placeholder="Enter admin notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '4px',
                      color: 'white',
                      fontFamily: 'inherit',
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActionDialog(null);
              setSelectedWithdrawal(null);
              setAdminNotes('');
            }}
            sx={{ color: 'white' }}
          >
            {actionDialog === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {(actionDialog === 'approve' || actionDialog === 'reject') && (
            <Button
              onClick={() => handleWithdrawalAction(actionDialog)}
              variant="contained"
              disabled={processingWithdrawal === selectedWithdrawal?.id}
              startIcon={processingWithdrawal === selectedWithdrawal?.id ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                backgroundColor: actionDialog === 'approve' ? '#00ff88' : '#ff4444',
                '&:hover': {
                  backgroundColor: actionDialog === 'approve' ? '#00ffaa' : '#ff6666',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {processingWithdrawal === selectedWithdrawal?.id 
                ? `${actionDialog === 'approve' ? 'Approving' : 'Rejecting'}...` 
                : actionDialog === 'approve' ? 'Approve' : 'Reject'
              }
            </Button>
          )}
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

export default WithdrawalsPage;
