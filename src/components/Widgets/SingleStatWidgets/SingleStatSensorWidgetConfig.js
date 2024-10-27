import React, { useState, useEffect } from 'react';
import { 
  Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import apiService from '../../../services/apiService';

function SingleStatSensorWidgetConfig({ widget, index, handleWidgetChange, selectedSite }) {
  const [availableSensors, setAvailableSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(widget.config.sensor || null);
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [valueRangeProfiles, setValueRangeProfiles] = useState([]);

  useEffect(() => {
    if (!widget.config.bucket) {
      handleWidgetChange(index, 'config.bucket', 'sensor_bucket');
    }
  }, []);

  useEffect(() => {
    if (!widget.config.siteId) {
      handleWidgetChange(index, 'config.siteId', selectedSite);
    }
  }, []);

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
    const selectedId = event.target.value;
    const newSelectedSensor = availableSensors.find(sensor => sensor.id === selectedId);
    setSelectedSensor(newSelectedSensor);
    handleWidgetChange(index, 'config.sensor', newSelectedSensor);
    handleWidgetChange(index, 'config.sensorId', newSelectedSensor.id);
  };

  const handleValueRangeProfileSelection = (event) => {
    const profileId = event.target.value;
    handleWidgetChange(index, 'config.valueRangeProfileId', profileId);
  };

  const handleBucketChange = (e) => {
    handleWidgetChange(index, 'config.bucket', e.target.value);
  };

  return (
    <>
      <Grid item xs={12}>
        <TextField
          label="Site ID"
          value={selectedSite || ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Bucket"
          value={widget.config.bucket || ''}
          onChange={handleBucketChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" color="primary" onClick={() => setSensorDialogOpen(true)}>
          Select Sensor
        </Button>
      </Grid>
      {selectedSensor && (
        <Grid item xs={12}>
          <TextField
            label="Selected Sensor"
            value={selectedSensor.name}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
      )}
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
          label="Time Range"
          value={widget.config.timeRange || '1h'}
          onChange={(e) => handleWidgetChange(index, 'config.timeRange', e.target.value)}
          fullWidth
          helperText="e.g., 1h, 30m, 1d"
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

      <Dialog open={sensorDialogOpen} onClose={() => setSensorDialogOpen(false)}>
        <DialogTitle>Select Sensor</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Sensor</InputLabel>
            <Select
              value={selectedSensor ? selectedSensor.id : ''}
              onChange={handleSensorSelection}
            >
              {availableSensors.map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
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

export default SingleStatSensorWidgetConfig;