import React, { useState, useEffect } from 'react';
import { 
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function ManualDataEntryWidgetConfig({ widget, index, handleWidgetChange, manualDataCaptureConfigs }) {
  const [selectedConfig, setSelectedConfig] = useState(widget.config.manualDataCaptureConfigId || '');

  const handleConfigChange = (event) => {
    const configId = event.target.value;
    setSelectedConfig(configId);
    handleWidgetChange(index, 'config.manualDataCaptureConfigId', configId);

    // Find the selected config and update the fields
    const selectedConfigData = manualDataCaptureConfigs.find(config => config.id === configId);
    if (selectedConfigData) {
      handleWidgetChange(index, 'config.fields', selectedConfigData.fields);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Manual Data Capture Configuration</InputLabel>
          <Select
            value={selectedConfig}
            onChange={handleConfigChange}
            label="Manual Data Capture Configuration"
          >
            {manualDataCaptureConfigs.map((config) => (
              <MenuItem key={config.id} value={config.id}>{config.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {selectedConfig && (
        <Grid item xs={12}>
          <List>
            {widget.config.fields.map((field, fieldIndex) => (
              <ListItem key={fieldIndex}>
                <ListItemText 
                  primary={field.name} 
                  secondary={`Type: ${field.type}${field.unit ? `, Unit: ${field.unit}` : ''}`} 
                />
              </ListItem>
            ))}
          </List>
        </Grid>
      )}
    </>
  );
}

export default ManualDataEntryWidgetConfig;