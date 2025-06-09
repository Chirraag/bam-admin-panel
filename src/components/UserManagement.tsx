import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface CrmUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<CrmUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_users')
        .select('id, email, password_hash, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' });
    }
  };

  const decodePassword = (passwordHash: string): string => {
    try {
      return atob(passwordHash);
    } catch (error) {
      return 'Invalid password hash';
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    const newVisiblePasswords = new Set(visiblePasswords);
    if (newVisiblePasswords.has(userId)) {
      newVisiblePasswords.delete(userId);
    } else {
      newVisiblePasswords.add(userId);
    }
    setVisiblePasswords(newVisiblePasswords);
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    // Password validation
    if (password.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters long', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Simple password hashing (in production, use bcrypt)
      const passwordHash = btoa(password);
      
      const { error } = await supabase
        .from('crm_users')
        .insert([
          {
            email,
            password_hash: passwordHash,
          },
        ]);

      if (error) throw error;

      setEmail('');
      setPassword('');
      setOpenCreateDialog(false);
      fetchUsers();
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === '23505') {
        setSnackbar({ open: true, message: 'A user with this email already exists', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Failed to create user', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: CrmUser) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditPassword(decodePassword(user.password_hash));
    setOpenEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editEmail || !editPassword) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    // Password validation
    if (editPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters long', severity: 'error' });
      return;
    }

    setEditLoading(true);
    try {
      const passwordHash = btoa(editPassword);
      
      const { error } = await supabase
        .from('crm_users')
        .update({
          email: editEmail,
          password_hash: passwordHash,
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      setOpenEditDialog(false);
      setEditingUser(null);
      setEditEmail('');
      setEditPassword('');
      fetchUsers();
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === '23505') {
        setSnackbar({ open: true, message: 'A user with this email already exists', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('crm_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      fetchUsers();
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  const handleCreateDialogClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setOpenCreateDialog(false);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setEditingUser(null);
    setEditEmail('');
    setEditPassword('');
    setShowEditPassword(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{ borderRadius: '8px' }}
        >
          Create User
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            CRM Users
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Password</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            bgcolor: 'grey.100',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            minWidth: '120px'
                          }}
                        >
                          {visiblePasswords.has(user.id) 
                            ? decodePassword(user.password_hash)
                            : '••••••••'
                          }
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => togglePasswordVisibility(user.id)}
                          sx={{ ml: 1 }}
                        >
                          {visiblePasswords.has(user.id) ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Active" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditUser(user)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      No users found. Create your first user to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Enter a valid email address"
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Password must be at least 6 characters long"
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Enter a valid email address"
          />
          <TextField
            label="Password"
            type={showEditPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            helperText="Password must be at least 6 characters long"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    edge="end"
                  >
                    {showEditPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {editingUser && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Editing user: <strong>{editingUser.email}</strong>
              <br />
              Created: {new Date(editingUser.created_at).toLocaleDateString()}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

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
}