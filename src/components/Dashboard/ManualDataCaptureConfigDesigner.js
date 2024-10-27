import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import apiService from '../../services/apiService';

function ManualDataCaptureConfigDesigner({ onSave, onClose, siteId }) {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    fields: []
  });
  const [newField, setNewField] = useState({ name: '', type: 'text' });

  const handleSave = async () => {
    try {
      const response = await apiService.post('/manual-data-capture-configs/', {
        ...config,
        site: siteId
      });
      onSave(response.data);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const addField = () => {
    setConfig({
      ...config,
      fields: [...config.fields, newField]
    });
    setNewField({ name: '', type: 'text' });
  };

  const removeField = (index) => {
    const updatedFields = config.fields.filter((_, i) => i !== index);
    setConfig({ ...config, fields: updatedFields });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Configuration Name"
          value={config.name}
          onChange={(e) => setConfig({ ...config, name: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={config.description}
          onChange={(e) => setConfig({ ...config, description: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Fields</Typography>
        {config.fields.map((field, index) => (
          <Grid container spacing={2} key={index} alignItems="center">
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Field Name"
                value={field.name}
                disabled
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Field Type"
                value={field.type}
                disabled
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton onClick={() => removeField(index)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid item xs={5}>
        <TextField
          fullWidth
          label="New Field Name"
          value={newField.name}
          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
        />
      </Grid>
      <Grid item xs={5}>
        <TextField
          fullWidth
          label="Field Type"
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
        />
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" onClick={addField}>Add Field</Button>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSave}>Save Configuration</Button>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
      </Grid>
    </Grid>
  );
}

export default ManualDataCaptureConfigDesigner;
