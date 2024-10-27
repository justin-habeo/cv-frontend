import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import apiService from '../../services/apiService';

function LocationManager({ siteId, onLocationSelect }) {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: '', latitude: '', longitude: '' });

  useEffect(() => {
    fetchLocations();
  }, [siteId]);

  const fetchLocations = async () => {
    try {
      const response = await apiService.get(`/locations/?site=${siteId}`);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleAddLocation = async () => {
    try {
      await apiService.post('/locations/', { ...newLocation, site: siteId });
      setNewLocation({ name: '', latitude: '', longitude: '' });
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  return (
    <Box>
      <TextField
        label="Name"
        value={newLocation.name}
        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
      />
      <TextField
        label="Latitude"
        value={newLocation.latitude}
        onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
      />
      <TextField
        label="Longitude"
        value={newLocation.longitude}
        onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
      />
      <Button onClick={handleAddLocation}>Add Location</Button>
      <List>
        {locations.map((location) => (
          <ListItem key={location.id} button onClick={() => onLocationSelect(location)}>
            <ListItemText primary={location.name} secondary={`${location.latitude}, ${location.longitude}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default LocationManager;
