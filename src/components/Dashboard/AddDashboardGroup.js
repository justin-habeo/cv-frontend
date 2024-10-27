// In AddDashboardGroup.js

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.primary.main,
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

function AddDashboardGroup({ open, onClose, onGroupAdded }) {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      onGroupAdded({ name: groupName.trim() });
      setGroupName('');
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle style={{ color: 'white' }}>Add New Dashboard Group</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <StyledTextField
            autoFocus
            margin="dense"
            id="name"
            label="Group Name"
            type="text"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} style={{ color: 'white' }}>
            Cancel
          </Button>
          <Button type="submit" disabled={!groupName.trim()} style={{ color: 'white' }}>
            Add Group
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
}

export default AddDashboardGroup;