import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress } from '@mui/material';
import apiService from '../../services/apiService';
import { GOOGLE_MAPS_OPTIONS } from '../../config/googleMapsConfig';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 0,
  lng: 0
};

function LocationSetup({ open, onClose, siteId, onLocationCreated }) {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: '', description: '', latitude: null, longitude: null });
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (open) {
      fetchLocations();
    }
  }, [open, siteId]);

  const fetchLocations = async () => {
    try {
      const response = await apiService.get(`/locations/?site=${siteId}`);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleMapClick = (event) => {
    setNewLocation({
      ...newLocation,
      latitude: event.latLng.lat(),
      longitude: event.latLng.lng()
    });
  };

  const handleAddLocation = async () => {
    try {
      const response = await apiService.post('/locations/', { 
        ...newLocation, 
        site: siteId,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude)
      });
      setNewLocation({ name: '', description: '', latitude: null, longitude: null });
      fetchLocations();
      if (onLocationCreated) {
        onLocationCreated(response.data);
      }
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Setup Locations</DialogTitle>
      <DialogContent>
        <Box height={400} width="100%" position="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={2}
            onClick={handleMapClick}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={GOOGLE_MAPS_OPTIONS}
          >
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={{ lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }}
                title={location.name}
              />
            ))}
            {newLocation.latitude && newLocation.longitude && (
              <Marker
                position={{ lat: parseFloat(newLocation.latitude), lng: parseFloat(newLocation.longitude) }}
                title="New Location"
              />
            )}
          </GoogleMap>
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            label="Location Name"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newLocation.description}
            onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Latitude"
            value={newLocation.latitude || ''}
            InputProps={{ readOnly: true }}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Longitude"
            value={newLocation.longitude || ''}
            InputProps={{ readOnly: true }}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddLocation} color="primary" disabled={!newLocation.name || !newLocation.latitude || !newLocation.longitude}>
          Add Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LocationSetup;