import React, { useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';

const UNITS = ['Liters', 'Cubic Meters', 'Gallons'];
const READING_TYPES = ['Irrigation', 'Rainfall', 'Reservoir Level', 'Water Usage'];
const WATER_SOURCES = ['Well', 'Rainwater Collection', 'Municipal Supply', 'River', 'Other'];
const DEFAULT_BUCKETS = ['weather_bucket', 'irrigation_bucket', 'sensor_bucket', 'maintenance_bucket'];

function WaterReadingCaptureWidgetConfig({ widget, index, handleWidgetChange, siteId }) {
  useEffect(() => {
    if (siteId && (!widget.config.siteId || widget.config.siteId !== siteId)) {
      handleWidgetChange(index, 'config.siteId', siteId);
      console.log(`Setting siteId ${siteId} for WaterReadingCaptureWidget`);
    }
    // Set default bucket to 'irrigation_bucket' if not already set
    if (!widget.config.defaultBucket) {
      handleWidgetChange(index, 'config.defaultBucket', 'irrigation_bucket');
    }
  }, [siteId, widget.config.siteId, index, handleWidgetChange]);

  const bucketOptions = [...DEFAULT_BUCKETS, widget.config.customBucket].filter(Boolean);

  return (
    <Box sx={{ '& > *': { marginBottom: 2 } }}>
      <TextField
        fullWidth
        label="Widget Title"
        value={widget.config.title || ''}
        onChange={(e) => handleWidgetChange(index, 'config.title', e.target.value)}
      />
      <FormControl fullWidth>
        <InputLabel>Default Unit</InputLabel>
        <Select
          value={widget.config.defaultUnit || ''}
          onChange={(e) => handleWidgetChange(index, 'config.defaultUnit', e.target.value)}
          label="Default Unit"
        >
          {UNITS.map((unit) => (
            <MenuItem key={unit} value={unit}>{unit}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Default Reading Type</InputLabel>
        <Select
          value={widget.config.defaultReadingType || ''}
          onChange={(e) => handleWidgetChange(index, 'config.defaultReadingType', e.target.value)}
          label="Default Reading Type"
        >
          {READING_TYPES.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Default Water Source</InputLabel>
        <Select
          value={widget.config.defaultSource || ''}
          onChange={(e) => handleWidgetChange(index, 'config.defaultSource', e.target.value)}
          label="Default Water Source"
        >
          {WATER_SOURCES.map((source) => (
            <MenuItem key={source} value={source}>{source}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Default Bucket</InputLabel>
        <Select
          value={widget.config.defaultBucket || 'irrigation_bucket'}
          onChange={(e) => handleWidgetChange(index, 'config.defaultBucket', e.target.value)}
          label="Default Bucket"
          disabled={true}
        >
          {bucketOptions.map((bucket) => (
            <MenuItem key={bucket} value={bucket}>{bucket}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body2" color="textSecondary">
        Note: The bucket is currently set to 'irrigation_bucket' and cannot be changed.
      </Typography>
      <TextField
        fullWidth
        label="Custom Bucket (optional)"
        value={widget.config.customBucket || ''}
        onChange={(e) => handleWidgetChange(index, 'config.customBucket', e.target.value)}
        helperText="If specified, this will be added to the bucket options in the widget"
      />
      <Typography variant="body2" color="textSecondary">
        Note: The custom bucket, if specified, will be available as an additional option in the widget's bucket dropdown.
      </Typography>
      <TextField
        fullWidth
        label="Site ID"
        value={widget.config.siteId || ''}
        disabled
        helperText="This is automatically set based on the selected site"
      />
    </Box>
  );
}

export default WaterReadingCaptureWidgetConfig;