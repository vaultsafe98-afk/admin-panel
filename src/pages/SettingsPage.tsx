import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save,
  Refresh,
  Security,
  AccountBalance,
  Notifications,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

interface Settings {
  walletAddress: string;
  systemMaintenance: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  profitRate: number;
  minDeposit: number;
  maxWithdrawal: number;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    walletAddress: '',
    systemMaintenance: false,
    emailNotifications: true,
    smsNotifications: false,
    profitRate: 0.1,
    minDeposit: 10,
    maxWithdrawal: 10000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSettings();
      const data = response.data as any;
      setSettings({
        walletAddress: data.walletAddress || '',
        systemMaintenance: data.maintenanceMode || false,
        emailNotifications: true, // Default value since not in API response
        smsNotifications: false, // Default value since not in API response
        profitRate: data.profitRate || 0.1,
        minDeposit: data.minimumDeposit || 10,
        maxWithdrawal: data.maximumWithdrawal || 10000,
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Update wallet address
      await adminApi.updateWalletAddress(settings.walletAddress);
      
      // TODO: Add other settings update APIs when available
      // await adminApi.updateSystemSettings({
      //   maintenanceMode: settings.systemMaintenance,
      //   profitRate: settings.profitRate,
      //   minimumDeposit: settings.minDeposit,
      //   maximumWithdrawal: settings.maxWithdrawal,
      // });
      
      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Settings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: field === 'profitRate' || field === 'minDeposit' || field === 'maxWithdrawal' 
        ? parseFloat(value as string) || 0 
        : value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 4 }}>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Wallet Settings */}
        <Card
          sx={{
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalance sx={{ color: '#00ff88', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#00ff88' }}>
                Wallet Settings
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Wallet Address"
              value={settings.walletAddress}
              onChange={handleInputChange('walletAddress')}
              multiline
              rows={3}
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
            
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={saving}
              sx={{
                backgroundColor: '#00ff88',
                '&:hover': { backgroundColor: '#00ffaa' },
              }}
            >
              {saving ? 'Saving...' : 'Save Wallet Address'}
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card
          sx={{
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Security sx={{ color: '#00ff88', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#00ff88' }}>
                System Settings
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.systemMaintenance}
                  onChange={handleInputChange('systemMaintenance')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff88',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff88',
                    },
                  }}
                />
              }
              label="System Maintenance Mode"
              sx={{ color: 'white', mb: 2 }}
            />
            
            <Divider sx={{ backgroundColor: 'rgba(0, 255, 136, 0.2)', my: 2 }} />
            
            <Box display="flex" alignItems="center" mb={2}>
              <Notifications sx={{ color: '#00ff88', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#00ff88' }}>
                Notifications
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleInputChange('emailNotifications')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff88',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff88',
                    },
                  }}
                />
              }
              label="Email Notifications"
              sx={{ color: 'white', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={handleInputChange('smsNotifications')}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff88',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff88',
                    },
                  }}
                />
              }
              label="SMS Notifications"
              sx={{ color: 'white' }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Financial Settings */}
      <Card
        sx={{
          background: 'rgba(30, 30, 30, 0.8)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 3 }}>
            Financial Settings
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="Profit Rate (%)"
              type="number"
              value={settings.profitRate}
              onChange={handleInputChange('profitRate')}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
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
                '& .MuiInputLabel-root': {
                  color: '#00ff88',
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Minimum Deposit ($)"
              type="number"
              value={settings.minDeposit}
              onChange={handleInputChange('minDeposit')}
              inputProps={{ min: 0, step: 1 }}
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
                '& .MuiInputLabel-root': {
                  color: '#00ff88',
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Maximum Withdrawal ($)"
              type="number"
              value={settings.maxWithdrawal}
              onChange={handleInputChange('maxWithdrawal')}
              inputProps={{ min: 0, step: 1 }}
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
                '& .MuiInputLabel-root': {
                  color: '#00ff88',
                },
              }}
            />
          </Box>
          
          <Box mt={3}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={saving}
              sx={{
                backgroundColor: '#00ff88',
                '&:hover': { backgroundColor: '#00ffaa' },
              }}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>

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

export default SettingsPage;
