import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  AccountBalance,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card
    sx={{
      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
      border: '1px solid rgba(0, 255, 136, 0.3)',
      borderRadius: 2,
      boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            color,
            '& svg': {
              fontSize: '3rem',
              opacity: 0.8,
            },
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getDashboardStats();
        setStats(response.data as any);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

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
        Dashboard
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Users"
          value={(stats.totalUsers || 0).toLocaleString()}
          icon={<People />}
          color="#00ff88"
        />
        <StatCard
          title="Total Deposits"
          value={`$${(stats.totalDeposits || 0).toLocaleString()}`}
          icon={<AccountBalance />}
          color="#00bfff"
        />
        <StatCard
          title="Total Withdrawals"
          value={`$${(stats.totalWithdrawals || 0).toLocaleString()}`}
          icon={<TrendingUp />}
          color="#ff8c00"
        />
        <StatCard
          title="Pending Deposits"
          value={(stats.pendingDeposits || 0).toLocaleString()}
          icon={<AttachMoney />}
          color="#8a2be2"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr',
          },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
            Recent Activity
          </Typography>
          <Typography color="text.secondary">
            Charts and analytics will be implemented here in future updates.
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
            Quick Actions
          </Typography>
          <Typography color="text.secondary">
            Quick action buttons will be added here.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
