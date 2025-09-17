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
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

interface Deposit {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  screenshotUrl: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const DepositsPage: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [processingDeposit, setProcessingDeposit] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDeposits(page + 1, rowsPerPage, statusFilter);
      setDeposits((response.data as any).deposits);
      setTotalDeposits((response.data as any).pagination.totalItems);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch deposits:', err);
      setError('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

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

  const handleDepositAction = async (action: 'approve' | 'reject') => {
    if (!selectedDeposit) return;

    try {
      setProcessingDeposit(selectedDeposit.id);
      
      if (action === 'approve') {
        await adminApi.approveDeposit(selectedDeposit.id, adminNotes);
        setSnackbar({ open: true, message: 'Deposit approved successfully', severity: 'success' });
      } else if (action === 'reject') {
        await adminApi.rejectDeposit(selectedDeposit.id, adminNotes);
        setSnackbar({ open: true, message: 'Deposit rejected successfully', severity: 'success' });
      }
      
      setActionDialog(null);
      setSelectedDeposit(null);
      setAdminNotes('');
      fetchDeposits();
    } catch (err: any) {
      console.error(`Failed to ${action} deposit:`, err);
      setSnackbar({ open: true, message: `Failed to ${action} deposit`, severity: 'error' });
    } finally {
      setProcessingDeposit(null);
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

  if (loading && deposits.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 4 }}>
        Deposits Management
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
              Deposits ({totalDeposits})
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
                onClick={fetchDeposits}
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
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Screenshot</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id} hover>
                  <TableCell sx={{ color: 'white' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {deposit.user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {deposit.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatCurrency(deposit.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={deposit.status}
                      color={getStatusColor(deposit.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => {
                        setSelectedDeposit(deposit);
                        setActionDialog('view');
                      }}
                      sx={{ color: '#00ff88' }}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{formatDate(deposit.createdAt)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {deposit.status === 'pending' && (
                        <>
                          <Tooltip title="Approve Deposit">
                            <IconButton
                              size="small"
                              sx={{ color: '#00ff88' }}
                              onClick={() => {
                                setSelectedDeposit(deposit);
                                setActionDialog('approve');
                              }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Deposit">
                            <IconButton
                              size="small"
                              sx={{ color: '#ff4444' }}
                              onClick={() => {
                                setSelectedDeposit(deposit);
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
          count={totalDeposits}
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
          setSelectedDeposit(null);
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
          {actionDialog === 'view' ? 'View Deposit' : 
           actionDialog === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
        </DialogTitle>
        <DialogContent>
          {selectedDeposit && (
            <Box>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>User:</strong> {selectedDeposit.user.name} ({selectedDeposit.user.email})
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Amount:</strong> {formatCurrency(selectedDeposit.amount)}
              </Typography>
              <Typography sx={{ color: 'white', mb: 2 }}>
                <strong>Date:</strong> {formatDate(selectedDeposit.createdAt)}
              </Typography>
              
              {actionDialog === 'view' && (
                <Box>
                  <Typography sx={{ color: 'white', mb: 1 }}>
                    <strong>Screenshot:</strong>
                    <a 
                      href={selectedDeposit.screenshotUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#00ff88', 
                        textDecoration: 'underline',
                        marginLeft: '10px'
                      }}
                    >
                      Open in new tab
                    </a>
                  </Typography>
                  {selectedDeposit.screenshotUrl ? (
                    <img
                      src={selectedDeposit.screenshotUrl}
                      alt="Deposit Screenshot"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: '4px',
                      }}
                      onError={(e) => {
                        console.error('Failed to load screenshot:', selectedDeposit.screenshotUrl);
                        e.currentTarget.style.display = 'none';
                        // Show error message
                        const errorDiv = document.createElement('div');
                        errorDiv.innerHTML = `
                          <div style="
                            padding: 20px;
                            text-align: center;
                            color: #ff6b6b;
                            border: 1px solid #ff6b6b;
                            border-radius: 4px;
                            background: rgba(255, 107, 107, 0.1);
                          ">
                            <strong>Screenshot not available</strong><br/>
                            <small>URL: ${selectedDeposit.screenshotUrl}</small>
                          </div>
                        `;
                        e.currentTarget.parentNode?.appendChild(errorDiv);
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#ff6b6b',
                      border: '1px solid #ff6b6b',
                      borderRadius: '4px',
                      background: 'rgba(255, 107, 107, 0.1)',
                    }}>
                      <strong>No screenshot provided</strong>
                    </div>
                  )}
                  {selectedDeposit.adminNotes && (
                    <Typography sx={{ color: 'white', mt: 2 }}>
                      <strong>Admin Notes:</strong> {selectedDeposit.adminNotes}
                    </Typography>
                  )}
                </Box>
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
              setSelectedDeposit(null);
              setAdminNotes('');
            }}
            sx={{ color: 'white' }}
          >
            {actionDialog === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {(actionDialog === 'approve' || actionDialog === 'reject') && (
            <Button
              onClick={() => handleDepositAction(actionDialog)}
              variant="contained"
              disabled={processingDeposit === selectedDeposit?.id}
              startIcon={processingDeposit === selectedDeposit?.id ? <CircularProgress size={16} color="inherit" /> : null}
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
              {processingDeposit === selectedDeposit?.id 
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

export default DepositsPage;
