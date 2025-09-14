import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            background: 'rgba(30, 30, 30, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: '#00ff88',
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                SafeVault Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crypto Wallet Management Panel
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Admin Credentials:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: admin@safevault.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Password: admin123456
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
