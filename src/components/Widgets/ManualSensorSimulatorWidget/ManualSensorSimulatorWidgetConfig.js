import React from 'react';
import { TextField, Box } from '@mui/material';

function ManualSensorSimulatorWidgetConfig({ widget, index, handleWidgetChange }) {
  return (
    <Box sx={{ '& > *': { marginBottom: 2 } }}>
      <TextField
        fullWidth
        label="Widget Title"
        value={widget.config.title || ''}
        onChange={(e) => handleWidgetChange(index, 'config.title', e.target.value)}
      />
    </Box>
  );
}

export default ManualSensorSimulatorWidgetConfig;