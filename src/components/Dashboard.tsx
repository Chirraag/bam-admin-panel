import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  ViewColumn as ViewColumnIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage CRM user accounts with secure authentication
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ViewColumnIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Column Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dynamically add and remove columns from your clients table
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <StorageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Database Schema
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time schema updates with metadata tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Start Guide
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Welcome to your CRM Admin Panel! Here's how to get started:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Use <strong>User Management</strong> to create and delete CRM user accounts
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Use <strong>Column Management</strong> to add custom fields to your clients table
          </Typography>
          <Typography component="li" variant="body2">
            All changes are automatically synced with your Supabase database
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}