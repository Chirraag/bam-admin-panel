import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      if (email === 'admin@crm.com' && password === 'CrmADMIN123$') {
        onLogin();
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 400,
            mx: 'auto',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <LockIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              CRM Admin
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                color: 'white'
              }}
            >
              Sign in to access the admin panel
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
                placeholder="Enter your email"
                required
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ mb: 3 }}
                placeholder="Enter your password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}