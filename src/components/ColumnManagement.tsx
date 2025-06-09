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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface ColumnMetadata {
  id: string;
  column_name: string;
  column_type: 'string' | 'integer' | 'date' | 'timestamp' | 'boolean' | 'dropdown';
  dropdown_options: string[] | null;
  created_at: string;
}

interface ClientsTableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

const columnTypeLabels = {
  string: 'Text',
  integer: 'Number',
  date: 'Date',
  timestamp: 'Date & Time',
  boolean: 'Yes/No',
  dropdown: 'Dropdown',
};

export default function ColumnManagement() {
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [clientsSchema, setClientsSchema] = useState<ClientsTableColumn[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnMetadata | null>(null);
  const [columnName, setColumnName] = useState('');
  const [editColumnName, setEditColumnName] = useState('');
  const [columnType, setColumnType] = useState<ColumnMetadata['column_type']>('string');
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchColumns();
    fetchClientsSchema();
  }, []);

  const fetchColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('column_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColumns(data || []);
    } catch (error) {
      console.error('Error fetching columns:', error);
      setSnackbar({ open: true, message: 'Failed to fetch columns', severity: 'error' });
    }
  };

  const fetchClientsSchema = async () => {
    try {
      const { data, error } = await supabase.rpc('get_table_schema', { 
        table_name: 'clients' 
      });

      if (error) {
        console.error('Error fetching schema:', error);
        setClientsSchema([]);
        return;
      }
      
      setClientsSchema(data || []);
    } catch (error) {
      console.error('Error fetching clients schema:', error);
      setClientsSchema([]);
    }
  };

  const getPostgresColumnType = (type: ColumnMetadata['column_type']) => {
    switch (type) {
      case 'string':
      case 'dropdown':
        return 'text';
      case 'integer':
        return 'integer';
      case 'date':
        return 'date';
      case 'timestamp':
        return 'timestamptz';
      case 'boolean':
        return 'boolean';
      default:
        return 'text';
    }
  };

  const getDefaultValue = (type: ColumnMetadata['column_type']) => {
    switch (type) {
      case 'string':
      case 'dropdown':
        return "DEFAULT ''";
      case 'integer':
        return 'DEFAULT 0';
      case 'date':
      case 'timestamp':
        return 'DEFAULT now()';
      case 'boolean':
        return 'DEFAULT false';
      default:
        return "DEFAULT ''";
    }
  };

  const handleAddDropdownOption = () => {
    setDropdownOptions([...dropdownOptions, '']);
  };

  const handleRemoveDropdownOption = (index: number) => {
    if (dropdownOptions.length > 1) {
      const newOptions = dropdownOptions.filter((_, i) => i !== index);
      setDropdownOptions(newOptions);
    }
  };

  const handleDropdownOptionChange = (index: number, value: string) => {
    const newOptions = [...dropdownOptions];
    newOptions[index] = value;
    setDropdownOptions(newOptions);
  };

  const resetForm = () => {
    setColumnName('');
    setColumnType('string');
    setDropdownOptions(['']);
  };

  const handleCreateColumn = async () => {
    if (!columnName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a column name', severity: 'error' });
      return;
    }

    if (columnType === 'dropdown') {
      const validOptions = dropdownOptions.filter(opt => opt.trim().length > 0);
      if (validOptions.length === 0) {
        setSnackbar({ open: true, message: 'Please enter at least one dropdown option', severity: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      // Clean column name (remove spaces, convert to lowercase, add prefix)
      const cleanColumnName = `custom_${columnName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
      
      // Parse dropdown options
      const options = columnType === 'dropdown' 
        ? dropdownOptions.filter(opt => opt.trim().length > 0)
        : null;

      // Get PostgreSQL column type and default value
      const postgresType = getPostgresColumnType(columnType);
      const defaultValue = getDefaultValue(columnType);
      
      // Create the ALTER TABLE SQL
      const alterTableSQL = `ALTER TABLE clients ADD COLUMN IF NOT EXISTS ${cleanColumnName} ${postgresType} ${defaultValue}`;
      
      console.log('Executing ALTER TABLE:', alterTableSQL);
      
      // Execute the ALTER TABLE command using our database function
      const { error: alterError } = await supabase.rpc('execute_sql', {
        sql: alterTableSQL
      });

      if (alterError) {
        console.error('ALTER TABLE failed:', alterError);
        throw new Error(`Failed to add column to clients table: ${alterError.message}`);
      }

      console.log('ALTER TABLE executed successfully');

      // Insert into metadata table after successful ALTER TABLE
      const { error: metadataError } = await supabase
        .from('column_metadata')
        .insert([
          {
            column_name: cleanColumnName,
            column_type: columnType,
            dropdown_options: options,
          },
        ]);

      if (metadataError) {
        console.error('Metadata insert failed:', metadataError);
        // Try to rollback the column addition
        await supabase.rpc('execute_sql', {
          sql: `ALTER TABLE clients DROP COLUMN IF EXISTS ${cleanColumnName}`
        });
        throw metadataError;
      }

      setSnackbar({ open: true, message: 'Column created successfully in both metadata and clients table!', severity: 'success' });

      // Reset form and refresh data
      resetForm();
      setOpenDialog(false);
      await fetchColumns();
      await fetchClientsSchema();

    } catch (error) {
      console.error('Error creating column:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to create column: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditColumn = (column: ColumnMetadata) => {
    setEditingColumn(column);
    // Extract the display name by removing the 'custom_' prefix
    const displayName = column.column_name.replace(/^custom_/, '').replace(/_/g, ' ');
    setEditColumnName(displayName);
    setOpenEditDialog(true);
  };

  const handleUpdateColumnName = async () => {
    if (!editingColumn || !editColumnName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a column name', severity: 'error' });
      return;
    }

    setEditLoading(true);
    try {
      // Clean new column name
      const newCleanColumnName = `custom_${editColumnName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
      
      // Check if the new name is different from the current name
      if (newCleanColumnName === editingColumn.column_name) {
        setSnackbar({ open: true, message: 'Column name is the same as current name', severity: 'error' });
        return;
      }

      // Check if the new column name already exists
      const existingColumn = columns.find(col => col.column_name === newCleanColumnName);
      if (existingColumn) {
        setSnackbar({ open: true, message: 'A column with this name already exists', severity: 'error' });
        return;
      }

      // Rename the column in the clients table
      const renameColumnSQL = `ALTER TABLE clients RENAME COLUMN ${editingColumn.column_name} TO ${newCleanColumnName}`;
      
      console.log('Executing RENAME COLUMN:', renameColumnSQL);
      
      const { error: alterError } = await supabase.rpc('execute_sql', {
        sql: renameColumnSQL
      });

      if (alterError) {
        console.error('RENAME COLUMN failed:', alterError);
        throw new Error(`Failed to rename column in clients table: ${alterError.message}`);
      }

      console.log('RENAME COLUMN executed successfully');

      // Update the metadata table
      const { error: metadataError } = await supabase
        .from('column_metadata')
        .update({ column_name: newCleanColumnName })
        .eq('id', editingColumn.id);

      if (metadataError) {
        console.error('Metadata update failed:', metadataError);
        // Try to rollback the column rename
        await supabase.rpc('execute_sql', {
          sql: `ALTER TABLE clients RENAME COLUMN ${newCleanColumnName} TO ${editingColumn.column_name}`
        });
        throw metadataError;
      }

      setSnackbar({ open: true, message: 'Column name updated successfully!', severity: 'success' });

      // Reset form and refresh data
      setOpenEditDialog(false);
      setEditingColumn(null);
      setEditColumnName('');
      await fetchColumns();
      await fetchClientsSchema();

    } catch (error) {
      console.error('Error updating column name:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to update column name: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteColumn = async (column: ColumnMetadata) => {
    if (!confirm(`Are you sure you want to delete the column "${column.column_name}"? This will permanently remove the column and all its data from the clients table.`)) {
      return;
    }

    try {
      // Create the DROP COLUMN SQL
      const dropColumnSQL = `ALTER TABLE clients DROP COLUMN IF EXISTS ${column.column_name}`;
      
      console.log('Executing DROP COLUMN:', dropColumnSQL);
      
      // Execute the DROP COLUMN command
      const { error: alterError } = await supabase.rpc('execute_sql', {
        sql: dropColumnSQL
      });

      if (alterError) {
        console.error('DROP COLUMN failed:', alterError);
        throw new Error(`Failed to drop column from clients table: ${alterError.message}`);
      }

      console.log('DROP COLUMN executed successfully');

      // Remove from metadata table after successful DROP COLUMN
      const { error: metadataError } = await supabase
        .from('column_metadata')
        .delete()
        .eq('id', column.id);

      if (metadataError) {
        console.error('Metadata delete failed:', metadataError);
        throw metadataError;
      }

      setSnackbar({ open: true, message: 'Column deleted successfully from both metadata and clients table!', severity: 'success' });
      
      await fetchColumns();
      await fetchClientsSchema();
      
    } catch (error) {
      console.error('Error deleting column:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to delete column: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    }
  };

  const handleDialogClose = () => {
    resetForm();
    setOpenDialog(false);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setEditingColumn(null);
    setEditColumnName('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Column Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: '8px' }}
        >
          Add Column
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Clients Table Schema */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon color="primary" />
                <Typography variant="h6">Clients Table Schema</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Column Name</strong></TableCell>
                      <TableCell><strong>Data Type</strong></TableCell>
                      <TableCell><strong>Nullable</strong></TableCell>
                      <TableCell><strong>Default Value</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientsSchema.map((col, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            fontFamily: 'monospace', 
                            bgcolor: col.column_name.startsWith('custom_') ? 'primary.light' : 'grey.100', 
                            color: col.column_name.startsWith('custom_') ? 'white' : 'inherit',
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            display: 'inline-block' 
                          }}>
                            {col.column_name}
                          </Typography>
                        </TableCell>
                        <TableCell>{col.data_type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={col.is_nullable === 'YES' ? 'Yes' : 'No'} 
                            size="small" 
                            color={col.is_nullable === 'YES' ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {col.column_default || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {clientsSchema.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 2 }}>
                          Loading schema information...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Dynamic Columns Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Dynamic Columns Management
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Column Name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Options</strong></TableCell>
                      <TableCell><strong>Created At</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {columns.map((column) => (
                      <TableRow key={column.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'primary.light', color: 'white', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                            {column.column_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={columnTypeLabels[column.column_type]} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {column.dropdown_options && column.dropdown_options.length > 0 ? (
                            <Stack direction="row\" spacing={0.5} flexWrap="wrap">
                              {column.dropdown_options.slice(0, 3).map((option, index) => (
                                <Chip 
                                  key={index}
                                  label={option} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mb: 0.5 }}
                                />
                              ))}
                              {column.dropdown_options.length > 3 && (
                                <Chip 
                                  label={`+${column.dropdown_options.length - 3} more`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mb: 0.5 }}
                                />
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>{new Date(column.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditColumn(column)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteColumn(column)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {columns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          No custom columns found. Add your first column to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Column Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="Column Name"
            fullWidth
            variant="outlined"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Column will be prefixed with 'custom_' and formatted for database use"
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Column Type</InputLabel>
            <Select
              value={columnType}
              label="Column Type"
              onChange={(e) => {
                const newType = e.target.value as ColumnMetadata['column_type'];
                setColumnType(newType);
                if (newType === 'dropdown' && dropdownOptions.length === 0) {
                  setDropdownOptions(['']);
                }
              }}
            >
              {Object.entries(columnTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {columnType === 'dropdown' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dropdown Options
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddDropdownOption}
                  variant="outlined"
                >
                  Add Option
                </Button>
              </Box>
              
              <Stack spacing={2}>
                {dropdownOptions.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label={`Option ${index + 1}`}
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={option}
                      onChange={(e) => handleDropdownOptionChange(index, e.target.value)}
                      placeholder="Enter option value"
                    />
                    {dropdownOptions.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveDropdownOption(index)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
              
              {dropdownOptions.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Click "Add Option" to create dropdown choices
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateColumn}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Add Column'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Column Name Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Column Name</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="Column Name"
            fullWidth
            variant="outlined"
            value={editColumnName}
            onChange={(e) => setEditColumnName(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Enter the new display name for this column"
          />
          
          {editingColumn && (
            <Alert severity="info\" sx={{ mt: 2 }}>
              Current database column name: <code>{editingColumn.column_name}</code>
              <br />
              New database column name will be: <code>custom_{editColumnName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}</code>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button
            onClick={handleUpdateColumnName}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? 'Updating...' : 'Update Name'}
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