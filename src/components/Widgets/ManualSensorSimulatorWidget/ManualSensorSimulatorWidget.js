import React, { useState, useEffect } from 'react';
import { Select, MenuItem, TextField, Button, Box, Typography, Snackbar, Alert, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WidgetWrapper from '../WidgetWrapper';
import apiService from '../../../services/apiService';

const DEFAULT_BUCKETS = ['weather_bucket', 'irrigation_bucket', 'sensor_bucket', 'maintenance_bucket'];
const DEFAULT_ADDITIONAL_TAGS = ['location', 'depth', 'unit', 'status'];

function ManualSensorSimulatorWidget({ config, isDesignMode, updateConfig, siteId, showHeader }) {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('sensor_bucket');
  const [customBucket, setCustomBucket] = useState('');
  const [sensorValue, setSensorValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [additionalTags, setAdditionalTags] = useState({});
  const [selectedAdditionalTags, setSelectedAdditionalTags] = useState([]);

  useEffect(() => {
    console.log("Component mounted or updated");
    console.log("Site ID:", siteId);
    console.log("Is Design Mode:", isDesignMode);

    if (!isDesignMode && siteId) {
      console.log("Fetching sensors...");
      fetchSensors();
    } else {
      console.log("Not fetching sensors - design mode or no site ID");
      setLoading(false);
    }
  }, [siteId, isDesignMode]);

  const fetchSensors = async () => {
    try {
      console.log(`Fetching sensors for site ID: ${siteId}`);
      const response = await apiService.get(`/sensors/?site=${siteId}`);
      console.log("Sensors fetched:", response.data);
      setSensors(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensors:', err);
      setError(`Failed to load sensors: ${err.message}`);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const timestamp = new Date(`${date}T${time}`).toISOString();
      const selectedSensorObj = sensors.find(s => s.id === selectedSensor);
      
      const payload = {
        measurement: 'sensor_reading',
        tags: {
          sensor_id: selectedSensor,
          sensor_name: selectedSensorObj.name,
          sensor_type: selectedSensorObj.sensor_type,
          ...additionalTags
        },
        fields: {
          value: parseFloat(sensorValue)
        },
        timestamp: timestamp,
        bucket: selectedBucket === 'custom' ? customBucket : selectedBucket,
        site_id: siteId
      };

      await apiService.post('/influxdb/write/', payload);
      setSubmissionStatus('success');
      setSnackbarOpen(true);
      setSensorValue('');
    } catch (err) {
      console.error('Error submitting sensor reading:', err);
      setSubmissionStatus('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAdditionalTagChange = (tagName, value) => {
    setAdditionalTags(prevTags => ({
      ...prevTags,
      [tagName]: value
    }));
  };

  const handleAdditionalTagSelect = (event) => {
    setSelectedAdditionalTags(event.target.value);
  };

  if (isDesignMode) {
    return (
      <WidgetWrapper title={config.title || 'Manual Sensor Simulator'} showHeader={showHeader}>
        <Typography>Manual Sensor Simulator Widget</Typography>
      </WidgetWrapper>
    );
  }

  if (loading) {
    return <WidgetWrapper title={config.title || 'Manual Sensor Simulator'} showHeader={showHeader}><Typography>Loading sensors...</Typography></WidgetWrapper>;
  }

  if (error) {
    return <WidgetWrapper title={config.title || 'Manual Sensor Simulator'} showHeader={showHeader}><Typography color="error">{error}</Typography></WidgetWrapper>;
  }

  console.log("Rendering widget with sensors:", sensors);

  return (
    <WidgetWrapper title={config.title || 'Manual Sensor Simulator'}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Select
          value={selectedSensor}
          onChange={(e) => setSelectedSensor(e.target.value)}
          fullWidth
          displayEmpty
        >
          <MenuItem value="" disabled>Select a sensor</MenuItem>
          {sensors.map((sensor) => (
            <MenuItem key={sensor.id} value={sensor.id}>{sensor.name} ({sensor.sensor_type})</MenuItem>
          ))}
        </Select>
        <Select
          value={selectedBucket}
          onChange={(e) => setSelectedBucket(e.target.value)}
          fullWidth
        >
          {DEFAULT_BUCKETS.map((bucket) => (
            <MenuItem key={bucket} value={bucket}>{bucket}</MenuItem>
          ))}
          <MenuItem value="custom">Custom Bucket</MenuItem>
        </Select>
        {selectedBucket === 'custom' && (
          <TextField
            value={customBucket}
            onChange={(e) => setCustomBucket(e.target.value)}
            label="Custom Bucket Name"
            fullWidth
          />
        )}
        <TextField
          value={sensorValue}
          onChange={(e) => setSensorValue(e.target.value)}
          label="Sensor Value"
          type="number"
          fullWidth
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Select
          multiple
          value={selectedAdditionalTags}
          onChange={handleAdditionalTagSelect}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          fullWidth
        >
          {DEFAULT_ADDITIONAL_TAGS.map((tag) => (
            <MenuItem key={tag} value={tag}>
              {tag}
            </MenuItem>
          ))}
        </Select>
        {selectedAdditionalTags.map((tag) => (
          <TextField
            key={tag}
            label={tag}
            value={additionalTags[tag] || ''}
            onChange={(e) => handleAdditionalTagChange(tag, e.target.value)}
            fullWidth
          />
        ))}
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedSensor || !sensorValue || (!selectedBucket || (selectedBucket === 'custom' && !customBucket))}
          startIcon={
            submissionStatus === 'success' ? <CheckCircleOutlineIcon color="success" /> :
            submissionStatus === 'error' ? <ErrorOutlineIcon color="error" /> :
            null
          }
        >
          Submit Reading
        </Button>
        </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={submissionStatus === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {submissionStatus === 'success' ? 'Reading submitted successfully' : 'Error submitting reading'}
        </Alert>
      </Snackbar>
    </WidgetWrapper>
  );
}

export default ManualSensorSimulatorWidget;