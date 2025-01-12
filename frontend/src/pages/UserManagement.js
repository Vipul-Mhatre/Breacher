import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { NotificationService } from '../services/NotificationService';

// Styled components
const StyledTableRow = styled(TableRow)(({ theme, role }) => ({
  backgroundColor: role === 'employee' ? 'rgba(255, 255, 0, 0.1)' : 'inherit',
  '&:hover': {
    backgroundColor: role === 'employee' 
      ? 'rgba(255, 255, 0, 0.2)' 
      : theme.palette.action.hover,
  }
}));

const RoleChip = styled(Chip)(({ theme, role }) => ({
  backgroundColor: role === 'employee' 
    ? 'rgba(255, 255, 0, 0.8)'
    : role === 'admin'
    ? theme.palette.error.main
    : theme.palette.primary.main,
  color: role === 'employee' ? '#000' : '#fff'
}));

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'analyst'
  });
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Update admin count whenever users change
    const admins = users.filter(user => user.role === 'admin');
    setAdminCount(admins.length);
  }, [users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      NotificationService.error('Failed to fetch users');
    }
  };

  const handleCreate = async () => {
    try {
      if (formData.role === 'admin' && adminCount >= 2) {
        NotificationService.error('Maximum number of admins (2) has been reached');
        return;
      }

      const response = await api.post('/users', formData);
      setUsers([...users, response.data.data]);
      setOpenDialog(false);
      NotificationService.success('User created successfully');
      clearForm();
    } catch (error) {
      NotificationService.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/users/${selectedUser._id}`, formData);
      NotificationService.success('User updated successfully');
      setOpenDialog(false);
      fetchUsers();
    } catch (error) {
      NotificationService.error('Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        NotificationService.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        NotificationService.error('Failed to delete user');
      }
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
          setSelectedUser(null);
          setOpenDialog(true);
        }}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user._id} role={user.role}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleChip
                    label={user.role}
                    role={user.role}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="analyst">Analyst</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              {adminCount < 2 && <MenuItem value="admin">Admin</MenuItem>}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={selectedUser ? handleUpdate : handleCreate}
            variant="contained"
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default UserManagement; 