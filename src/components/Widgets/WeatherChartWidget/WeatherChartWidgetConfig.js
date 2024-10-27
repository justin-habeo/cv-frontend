import React from 'react';
import { 
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function WeatherChartWidgetConfig({ 
  widget, 
  index, 
  handleWidgetChange, 
  locations, 
  setIsLocationSetupOpen 
}) {
  const handleDateChange = (field) => (date) => {
    handleWidgetChange(index, `config.${field}`, date ? date.format('YYYY-MM-DD') : null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ marginTop: '16px' }}> {/* Added top margin here */}
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
        <Grid item xs={6}>
          <DatePicker
            label="Start Date"
            value={widget.config.startDate ? dayjs(widget.config.startDate) : null}
            onChange={handleDateChange('startDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            label="End Date"
            value={widget.config.endDate ? dayjs(widget.config.endDate) : null}
            onChange={handleDateChange('endDate')}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
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
    </LocalizationProvider>
  );
}

export default WeatherChartWidgetConfig;