import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#2C7873',
    color: 'white',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
});

function AddDashboard({ open, onClose, onDashboardAdded }) {
  const [dashboardName, setDashboardName] = useState('');

  const handleSubmit = () => {
    onDashboardAdded({ name: dashboardName });
    setDashboardName('');
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>Add New Dashboard</DialogTitle>
      <DialogContent>
        <StyledTextField
          autoFocus
          margin="dense"
          id="name"
          label="Dashboard Name"
          type="text"
          fullWidth
          variant="outlined"
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} style={{ color: 'white' }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" style={{ backgroundColor: 'white', color: '#2C7873' }}>
          Add
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

export default AddDashboard;