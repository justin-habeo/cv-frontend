// src/Widgets/YoloWidgets/CameraStreamWidgetConfig.js
import React, { useState, useEffect } from 'react';
import { 
    Grid, FormControl, InputLabel, Select, MenuItem, 
    FormControlLabel, Switch, CircularProgress,
    Typography 
} from '@mui/material';
import apiService from '../../../services/apiService';

const CameraStreamWidgetConfig = ({ widget, index, handleWidgetChange, selectedSite }) => {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                <FormControlLabel
                    control={
                        <Switch
                            checked={widget.config.showDetections || false}
                            onChange={(e) => handleWidgetChange(index, 'config.showDetections', e.target.checked)}
                        />
                    }
                    label="Show Detections"
                />
            </Grid>

            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={widget.config.showZones || false}
                            onChange={(e) => handleWidgetChange(index, 'config.showZones', e.target.checked)}
                        />
                    }
                    label="Show Zones"
                />
            </Grid>

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

export default CameraStreamWidgetConfig;