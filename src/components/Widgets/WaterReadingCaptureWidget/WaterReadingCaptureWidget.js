import React, { useState, useEffect } from 'react';
import { Select, MenuItem, TextField, Button, Box, Typography, Snackbar, Alert } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';
import apiService from '../../../services/apiService';

const UNITS = ['Liters', 'Cubic Meters', 'Gallons'];
const READING_TYPES = ['Irrigation', 'Rainfall', 'Reservoir Level', 'Water Usage'];
const WATER_SOURCES = ['Well', 'Rainwater Collection', 'Municipal Supply', 'River', 'Other'];
const DEFAULT_BUCKETS = ['weather_bucket', 'irrigation_bucket', 'sensor_bucket', 'maintenance_bucket'];

function WaterReadingCaptureWidget({ config, isDesignMode, updateConfig, showHeader }) {
  const [zones, setZones] = useState([]);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState(config.defaultUnit || 'Liters');
  const [selectedZone, setSelectedZone] = useState('');
  const [readingType, setReadingType] = useState(config.defaultReadingType || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
  const [source, setSource] = useState(config.defaultSource || '');
  const [bucket, setBucket] = useState('irrigation_bucket');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const siteId = config.siteId;

  const bucketOptions = [...DEFAULT_BUCKETS, config.customBucket].filter(Boolean);

  useEffect(() => {
    console.log("WaterReadingCaptureWidget useEffect triggered");
    console.log("config: ", config);
    console.log("isDesignMode:", isDesignMode);
    console.log("siteId:", siteId);

    if (!isDesignMode && siteId) {
      console.log("Attempting to fetch zones for siteId:", siteId);
      fetchZones();
    } else {
      console.log("Not fetching zones: isDesignMode or no siteId");
      setLoading(false);
    }
  }, [siteId, isDesignMode]);

  const fetchZones = async () => {
    try {
      console.log("Fetching zones from API");
      const response = await apiService.get(`/zones/by_site/?site=${siteId}`);
      console.log("Zones API response:", response);
      setZones(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setError('Failed to load zones: ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const timestamp = new Date(`${date}T${time}`).toISOString();
      const payload = {
        measurement: 'water_reading',
        tags: {
          site_id: config.siteId,
          zone_id: selectedZone,
          unit: unit,
          reading_type: readingType,
          source: source
        },
        fields: {
          value: parseFloat(value)
        },
        timestamp: timestamp,
        bucket: bucket,
        site_id: String(config.siteId) 
      };
      console.log("Submitting water reading:", payload);
      await apiService.post('/influxdb/write/', payload);
      setSubmissionStatus('success');
      setSnackbarOpen(true);
      setValue('');
      setNotes('');
    } catch (err) {
      console.error('Error submitting water reading:', err);
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

  if (isDesignMode) {
    return (
      <WidgetWrapper title={config.title || 'Water Reading Capture'} showHeader={showHeader}>
        <Typography>Water Reading Capture Widget</Typography>
      </WidgetWrapper>
    );
  }

  if (loading) {
    return <WidgetWrapper title={config.title || 'Water Reading Capture'} showHeader={showHeader}><Typography>Loading zones...</Typography></WidgetWrapper>;
  }

  if (error) {
    return <WidgetWrapper title={config.title || 'Water Reading Capture'} showHeader={showHeader}><Typography color="error">{error}</Typography></WidgetWrapper>;
  }

  return (
    <WidgetWrapper title={config.title || 'Water Reading Capture'} showHeader={showHeader}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          label="Reading Value"
          type="number"
          fullWidth
        />
        <Select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          fullWidth
          label="Unit"
        >
          {UNITS.map((u) => (
            <MenuItem key={u} value={u}>{u}</MenuItem>
          ))}
        </Select>
        <Select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          fullWidth
          label="Zone"
        >
          {zones.map((zone) => (
            <MenuItem key={zone.id} value={zone.id}>{zone.name}</MenuItem>
          ))}
        </Select>
        <Select
          value={readingType}
          onChange={(e) => setReadingType(e.target.value)}
          fullWidth
          label="Reading Type"
        >
          {READING_TYPES.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
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
          value={source}
          onChange={(e) => setSource(e.target.value)}
          fullWidth
          label="Water Source"
        >
          {WATER_SOURCES.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
        <Select
          value={bucket}
          onChange={(e) => setBucket(e.target.value)}
          fullWidth
          label="Bucket"
          disabled={true}
        >
          {bucketOptions.map((b) => (
            <MenuItem key={b} value={b}>{b}</MenuItem>
          ))}
        </Select>
        <TextField
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          label="Notes"
          multiline
          rows={3}
          fullWidth
        />
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!value || !selectedZone || !readingType || !source}
        >
          Submit Reading
        </Button>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={submissionStatus === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {submissionStatus === 'success' ? 'Water reading submitted successfully' : 'Error submitting water reading'}
        </Alert>
      </Snackbar>
    </WidgetWrapper>
  );
}

export default WaterReadingCaptureWidget;