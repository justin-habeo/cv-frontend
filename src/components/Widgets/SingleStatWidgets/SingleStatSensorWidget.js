import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import WidgetWrapper from '../WidgetWrapper';
import influxDBService from '../../../services/influxDBService';
import apiService from '../../../services/apiService';

function getContrastColor(hexColor) {
  if (!hexColor) return 'black';
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

function SingleStatSensorWidget({ config, isDesignMode, showHeader }) {
  const [sensorData, setSensorData] = useState(null);
  const [valueRangeProfile, setValueRangeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('Widget config:', config);

  const fetchValueRangeProfile = useCallback(async () => {
    if (config.valueRangeProfileId) {
      try {
        const response = await apiService.get(`/value-range-profiles/${config.valueRangeProfileId}/`);
        console.log('Value Range Profile:', response.data);
        setValueRangeProfile(response.data);
      } catch (error) {
        console.error('Error fetching value range profile:', error);
        setError('Error fetching value range profile');
      }
    }
  }, [config.valueRangeProfileId]);

  const fetchSensorData = useCallback(async () => {
    if (isDesignMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = `from(bucket:"${config.bucket}")
        |> range(start: -${config.timeRange || '1h'})
        |> filter(fn: (r) => r._measurement == "sensor_reading" and r.sensor_id == "${config.sensorId}")
        |> last()`;
      
      const response = await influxDBService.fetchInfluxDBData(query, config.bucket, config.siteId);
      console.log('Sensor Data Response:', response);

      if (response && response.length > 0) {
        setSensorData(prevData => ({
          ...prevData,
          ...response[0],
          _value: response[0]._value,
          _time: response[0]._time
        }));
        setError(null);
      } else {
        setError('No recent data available');
        setSensorData(null);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('Error fetching sensor data');
      setSensorData(null);
    } finally {
      setLoading(false);
    }
  }, [config.bucket, config.sensorId, config.siteId, config.timeRange, isDesignMode]);

  useEffect(() => {
    fetchValueRangeProfile();
  }, [fetchValueRangeProfile]);

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, (config.refreshInterval || 5) * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSensorData, config.refreshInterval]);

  useEffect(() => {
    setSensorData(prevData => ({
      ...prevData,
      sensor_name: config.sensor?.name || 'Unknown Sensor',
      sensor_type: config.sensor?.sensor_type || 'Unknown Type',
    }));
  }, [config.sensor]);

  const getValueRangeInfo = () => {
    if (!valueRangeProfile || !sensorData || sensorData._value === null) {
      return { color: 'white', label: '', textColor: 'black' };
    }
  
    const value = sensorData._value;
    const epsilon = 0.000001; // A small number to account for floating-point imprecision
    const range = valueRangeProfile.ranges.find(
      r => value >= r.lower_bound && value < (r.upper_bound + epsilon)
    );
  
    return range 
      ? { color: range.color, label: range.label, textColor: getContrastColor(range.color) }
      : { color: 'white', label: '', textColor: 'black' };
  };

  const renderContent = () => {
    console.log('Rendering content. Loading:', loading, 'Sensor Data:', sensorData, 'Error:', error);
  
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }
  
    const { color: backgroundColor, label: valueLabel, textColor } = getValueRangeInfo();
    console.log('Background Color:', backgroundColor, 'Value Label:', valueLabel, 'Text Color:', textColor);
  
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        textAlign="center"
        bgcolor={backgroundColor}
        color={textColor}
        p={2}
        borderRadius={1}
      >
        {sensorData && sensorData._value !== null ? (
          <>
            <Typography variant="h4">{sensorData._value}{config.unit}</Typography>
            {valueLabel && <Typography variant="subtitle1">{valueLabel}</Typography>}
          </>
        ) : (
          <Typography variant="h4" color="textSecondary">No data</Typography>
        )}
        <Typography variant="subtitle1">{sensorData?.sensor_name || 'Unknown Sensor'}</Typography>
        <Typography variant="body2">Sensor Type: {sensorData?.sensor_type || 'Unknown Type'}</Typography>
        {sensorData && sensorData._time ? (
          <Typography variant="caption">Last updated: {new Date(sensorData._time).toLocaleString()}</Typography>
        ) : (
          <Typography variant="caption" color="error">{error || 'No recent data'}</Typography>
        )}
      </Box>
    );
  };

  return (
    <WidgetWrapper title={config.title || 'Sensor Data'} showHeader={showHeader}>
      <Box height="100%" bgcolor="white">
        {renderContent()}
      </Box>
    </WidgetWrapper>
  );
}

export default SingleStatSensorWidget;