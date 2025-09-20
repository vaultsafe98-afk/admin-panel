import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  depositAmount: number;
  totalAmount: number;
  status: string;
  accountStatus: string;
  createdAt: string;
}

const PendingUsersPage: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [trcAddress, setTrcAddress] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingUsers();
      setPendingUsers(response.data as PendingUser[]);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch pending users:', err);
      setError('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedUser || !trcAddress) return;

    try {
      // Validate TRC address format
      if (!trcAddress.startsWith('T') || trcAddress.length !== 34) {
        setError('Invalid TRC address format. Must start with T and be 34 characters long');
        return;
      }

      setActionLoading(true);
      await adminApi.approveUser(selectedUser.id, trcAddress);
      
      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setActionDialog(null);
      setSelectedUser(null);
      setTrcAddress('');
      setError(null);
    } catch (err: any) {
      console.error('Failed to approve user:', err);
      setError(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      await adminApi.rejectUser(selectedUser.id, rejectionReason);
      
      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setActionDialog(null);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error('Failed to reject user:', err);
      setError('Failed to reject user');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 4 }}>
        Pending Account Approvals
      </Typography>

      {pendingUsers.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
            No Pending Approvals
          </Typography>
          <Typography color="text.secondary">
            All user accounts have been reviewed and processed.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Balance</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ color: '#00ff88', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ mr: 1, color: '#00ff88' }} />
                      <Box>
                        <Typography sx={{ color: 'white', fontWeight: 'medium' }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>{user.email}</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {formatCurrency(user.depositAmount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Pending Review"
                      color="warning"
                      size="small"
                      sx={{
                        backgroundColor: '#ff9800',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Approve Account">
                        <IconButton
                          size="small"
                          sx={{ color: '#4caf50' }}
                          onClick={() => {
                            setSelectedUser(user);
                            setActionDialog('approve');
                          }}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject Account">
                        <IconButton
                          size="small"
                          sx={{ color: '#f44336' }}
                          onClick={() => {
                            setSelectedUser(user);
                            setActionDialog('reject');
                          }}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog !== null}
        onClose={() => {
          setActionDialog(null);
          setSelectedUser(null);
          setRejectionReason('');
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#00ff88' }}>
          {actionDialog === 'approve' ? 'Approve Account' : 'Reject Account'}
        </DialogTitle>
        <DialogContent>
          {actionDialog === 'approve' ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: 'white', mb: 2 }}>
                Approve account for {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <Typography sx={{ color: '#ccc', mb: 2, fontSize: '0.9rem' }}>
                Email: {selectedUser?.email}
              </Typography>
              <TextField
                fullWidth
                label="TRC Address (USDT Deposit Address)"
                value={trcAddress}
                onChange={(e) => setTrcAddress(e.target.value)}
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
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: 'white', mb: 2 }}>
                Reject account for {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <TextField
                fullWidth
                label="Reason for Rejection"
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#f44336' },
                    '&.Mui-focused fieldset': { borderColor: '#f44336' },
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#f44336' },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActionDialog(null);
              setSelectedUser(null);
              setRejectionReason('');
              setTrcAddress('');
            }}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            onClick={actionDialog === 'approve' ? handleApprove : handleReject}
            variant="contained"
            disabled={actionLoading || (actionDialog === 'reject' && !rejectionReason.trim()) || (actionDialog === 'approve' && !trcAddress.trim())}
            sx={{
              backgroundColor: actionDialog === 'approve' ? '#4caf50' : '#f44336',
              '&:hover': {
                backgroundColor: actionDialog === 'approve' ? '#66bb6a' : '#ef5350',
              },
              '&:disabled': {
                backgroundColor: '#555',
                color: '#999',
              },
            }}
          >
            {actionLoading ? 'Processing...' : actionDialog === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingUsersPage;
