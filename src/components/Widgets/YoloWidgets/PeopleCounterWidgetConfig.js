// src/Widgets/YoloWidgets/PeopleCounterWidgetConfig.js
import React, { useState, useEffect } from 'react';
import { 
    Grid, FormControl, InputLabel, Select, MenuItem, 
    FormControlLabel, Switch, TextField, CircularProgress,
    Typography 
} from '@mui/material';
import apiService from '../../../services/apiService';

const PeopleCounterWidgetConfig = ({ widget, index, handleWidgetChange, selectedSite }) => {
    const [cameras, setCameras] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoneError, setZoneError] = useState(null);
    const [zonesLoading, setZonesLoading] = useState(false);

    // Fetch cameras when site changes
    useEffect(() => {
        const fetchCameras = async () => {
            if (!selectedSite) {
                setLoading(false);
                return;
            }
    
            try {
                setLoading(true);
                console.log('Fetching cameras for site:', selectedSite);
                const response = await apiService.get(`/cv/cameras/by-site/?site=${selectedSite}`);
                console.log('Camera response:', response);
                setCameras(response.data);
            } catch (error) {
                console.error('Error fetching cameras:', error);
                setError('Failed to load cameras');
            } finally {
                setLoading(false);
            }
        };
    
        fetchCameras();
    }, [selectedSite]);

    // Fetch zones when camera changes
    useEffect(() => {
      const fetchZones = async () => {
        if (!widget.config.cameraId) {
            setZones([]);
            setZoneError(null);
            return;
        }

        try {
            setZonesLoading(true);
            setZoneError(null);
            console.log('Fetching zones for camera:', widget.config.cameraId);
            // Updated URL to match DRF Router pattern
            const response = await apiService.get(`/cv/zones/by_camera/?camera=${widget.config.cameraId}`);
            console.log('Zones response:', response);
            
            if (response.data) {
                setZones(response.data);
                if (response.data.length === 0) {
                    setZoneError('No zones configured for this camera');
                }
            } else {
                setZoneError('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
            setZoneError(error.response?.data?.error || 'Failed to load zones');
            setZones([]);
        } finally {
            setZonesLoading(false);
        }
      };

      fetchZones();
    }, [widget.config.cameraId]);

    if (loading) {
        return (
            <Grid container justifyContent="center" padding={2}>
                <CircularProgress size={24} />
            </Grid>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                {error}
            </Typography>
        );
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Camera</InputLabel>
                    <Select
                        value={widget.config.cameraId || ''}
                        onChange={(e) => {
                            console.log('Selected camera:', e.target.value);
                            handleWidgetChange(index, 'config.cameraId', e.target.value);
                            // Clear zone selection when camera changes
                            handleWidgetChange(index, 'config.zoneId', '');
                        }}
                        label="Camera"
                    >
                        {cameras.length === 0 ? (
                            <MenuItem disabled>
                                No cameras configured
                            </MenuItem>
                        ) : (
                            cameras.map((camera) => (
                                <MenuItem key={camera.id} value={camera.id}>
                                    {camera.name}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                  <InputLabel>Zone</InputLabel>
                  <Select
                      value={widget.config.zoneId || ''}
                      onChange={(e) => handleWidgetChange(index, 'config.zoneId', e.target.value)}
                      label="Zone"
                      disabled={!widget.config.cameraId || zonesLoading}
                  >
                      {zonesLoading ? (
                          <MenuItem disabled>Loading zones...</MenuItem>
                      ) : zones.length === 0 ? (
                          <MenuItem disabled>
                              {zoneError || 'No zones available'}
                          </MenuItem>
                      ) : (
                          zones.map((zone) => (
                              <MenuItem key={zone.id} value={zone.id}>
                                  {zone.name}
                              </MenuItem>
                          ))
                      )}
                  </Select>
              </FormControl>
              {zoneError && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {zoneError}
                  </Typography>
              )}
          </Grid>

            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={widget.config.showTrends || false}
                            onChange={(e) => handleWidgetChange(index, 'config.showTrends', e.target.checked)}
                        />
                    }
                    label="Show Trends"
                />
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Refresh Interval (seconds)"
                    type="number"
                    value={widget.config.refreshInterval || 5}
                    onChange={(e) => handleWidgetChange(index, 'config.refreshInterval', Number(e.target.value))}
                    InputProps={{
                        inputProps: { min: 1 }
                    }}
                />
            </Grid>

            {widget.config.showTrends && (
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Trend Time Window (minutes)"
                        type="number"
                        value={widget.config.trendWindow || 30}
                        onChange={(e) => handleWidgetChange(index, 'config.trendWindow', Number(e.target.value))}
                        InputProps={{
                            inputProps: { min: 1 }
                        }}
                    />
                </Grid>
            )}

            {cameras.length === 0 && (
                <Grid item xs={12}>
                    <Typography color="textSecondary" variant="body2">
                        No cameras are configured. Please add cameras in the admin panel first.
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
};

export default PeopleCounterWidgetConfig;