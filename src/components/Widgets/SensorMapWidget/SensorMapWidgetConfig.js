import React, { useState, useEffect } from 'react';
import { 
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  Checkbox, ListItemText, List, ListItem, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import apiService from '../../../services/apiService';

function SensorMapWidgetConfig({ widget, index, handleWidgetChange, selectedSite }) {
  const [availableSensors, setAvailableSensors] = useState([]);
  const [selectedSensors, setSelectedSensors] = useState(widget.config.sensors || []);
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [valueRangeProfiles, setValueRangeProfiles] = useState([]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await apiService.get(`/sensors/?site=${widget.config.siteId}`);
        setAvailableSensors(response.data);
      } catch (error) {
        console.error('Error fetching sensors:', error);
      }
    };
    if (widget.config.siteId) {
      fetchSensors();
    }
  }, [widget.config.siteId]);

  useEffect(() => {
    const fetchValueRangeProfiles = async () => {
      try {
        const response = await apiService.get(`/value-range-profiles/`);
        setValueRangeProfiles(response.data);
      } catch (error) {
        console.error('Error fetching value range profiles:', error);
      }
    };
    fetchValueRangeProfiles();
  }, []);

  const handleSensorSelection = (event) => {
    const selectedIds = event.target.value;
    const newSelectedSensors = availableSensors.filter(sensor => selectedIds.includes(sensor.id));
    setSelectedSensors(newSelectedSensors);
    handleWidgetChange(index, 'config.sensors', newSelectedSensors);
  };

  const handleRemoveSensor = (sensorId) => {
    const updatedSensors = selectedSensors.filter(sensor => sensor.id !== sensorId);
    setSelectedSensors(updatedSensors);
    handleWidgetChange(index, 'config.sensors', updatedSensors);
  };

  const handleValueRangeProfileSelection = (event) => {
    const profileId = event.target.value;
    handleWidgetChange(index, 'config.valueRangeProfileId', profileId);
  };

  return (
    <>
      <Grid item xs={12}>
        <TextField
          label="Site ID"
          value={widget.config.siteId || ''}
          onChange={(e) => handleWidgetChange(index, 'config.siteId', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" color="primary" onClick={() => setSensorDialogOpen(true)}>
          Select Sensors
        </Button>
      </Grid>
      <Grid item xs={12}>
        <List>
          {selectedSensors.map((sensor) => (
            <ListItem key={sensor.id}>
              <ListItemText primary={sensor.name} secondary={sensor.sensor_type} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSensor(sensor.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Value Range Profile</InputLabel>
          <Select
            value={widget.config.valueRangeProfileId || ''}
            onChange={handleValueRangeProfileSelection}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {valueRangeProfiles.map((profile) => (
              <MenuItem key={profile.id} value={profile.id}>
                {profile.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Unit"
          value={widget.config.unit || ''}
          onChange={(e) => handleWidgetChange(index, 'config.unit', e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Refresh Interval (minutes)"
          type="number"
          value={widget.config.refreshInterval || 5}
          onChange={(e) => handleWidgetChange(index, 'config.refreshInterval', parseInt(e.target.value))}
          fullWidth
          inputProps={{ min: 1 }}
          helperText="Minimum 1 minute"
        />
      </Grid>

      <Dialog open={sensorDialogOpen} onClose={() => setSensorDialogOpen(false)}>
        <DialogTitle>Select Sensors</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Sensors</InputLabel>
            <Select
              multiple
              value={selectedSensors.map(s => s.id)}
              onChange={handleSensorSelection}
              renderValue={(selected) => selected.map(id => availableSensors.find(s => s.id === id)?.name).join(', ')}
            >
              {availableSensors.map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
                  <Checkbox checked={selectedSensors.some(s => s.id === sensor.id)} />
                  <ListItemText primary={sensor.name} secondary={sensor.sensor_type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSensorDialogOpen(false)} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default SensorMapWidgetConfig;