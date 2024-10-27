import React from 'react';
import { 
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button
} from '@mui/material';

function SoilDataWidgetConfig({ 
  widget, 
  index, 
  handleWidgetChange, 
  locations, 
  setIsLocationSetupOpen 
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ marginTop: '16px' }}>
        <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={widget.config.locationId || ''}
            onChange={(e) => {
              const locationId = e.target.value;
              if (locationId) {
                const location = locations.find(loc => loc.id === locationId);
                handleWidgetChange(index, 'config', {
                  ...widget.config,
                  locationId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                });
              } else {
                handleWidgetChange(index, 'config', {
                  ...widget.config,
                  locationId: null,
                });
              }
            }}
            label="Location"
          >
            <MenuItem value="">
              <em>Use custom coordinates</em>
            </MenuItem>
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {!widget.config.locationId && (
        <>
          <Grid item xs={6}>
            <TextField
              label="Latitude"
              type="number"
              value={widget.config.latitude || ''}
              onChange={(e) => handleWidgetChange(index, 'config.latitude', parseFloat(e.target.value))}
              fullWidth
              inputProps={{ step: 'any' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Longitude"
              type="number"
              value={widget.config.longitude || ''}
              onChange={(e) => handleWidgetChange(index, 'config.longitude', parseFloat(e.target.value))}
              fullWidth
              inputProps={{ step: 'any' }}
            />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        <Button 
          onClick={() => setIsLocationSetupOpen(true)} 
          variant="outlined" 
          color="primary"
          fullWidth
        >
          Create New Location
        </Button>
      </Grid>
    </Grid>
  );
}

export default SoilDataWidgetConfig;
