import React from 'react';
import { 
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function NDVISummaryWidgetConfig({ widget, index, handleWidgetChange, sitePolygons, handlePolygonIdChange }) {
  const handleDateChange = (field) => (date) => {
    handleWidgetChange(index, `config.${field}`, date ? date.format('YYYY-MM-DD') : null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ marginTop: '16px' }}>
          <FormControl fullWidth>
            <InputLabel>Polygon</InputLabel>
            <Select
              value={widget.config.agromonitoringPolygonId || ''}
              onChange={(e) => {
                const selectedPolygon = sitePolygons.find(p => p.agromonitoring_polygon_id === e.target.value);
                handleWidgetChange(index, 'config', {
                  ...widget.config,
                  agromonitoringPolygonId: e.target.value,
                });
                if (selectedPolygon) {
                  handlePolygonIdChange(index, e.target.value);
                }
              }}
              label="Polygon"
            >
              {sitePolygons.map((polygon) => (
                <MenuItem key={polygon.id} value={polygon.agromonitoring_polygon_id}>{polygon.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            label="Start Date"
            value={widget.config.startDate ? dayjs(widget.config.startDate) : null}
            onChange={(date) => handleWidgetChange(index, 'config.startDate', date.toISOString().split('T')[0])}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            label="End Date"
            value={widget.config.endDate ? dayjs(widget.config.endDate) : null}
            onChange={(date) => handleWidgetChange(index, 'config.endDate', date.toISOString().split('T')[0])}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        {widget.config.bounds && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Polygon Bounds (Automatically Set)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Top Left Lat"
                type="number"
                value={widget.config.bounds.topLeft[0] || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Top Left Lon"
                type="number"
                value={widget.config.bounds.topLeft[1] || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Bottom Right Lat"
                type="number"
                value={widget.config.bounds.bottomRight[0] || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Bottom Right Lon"
                type="number"
                value={widget.config.bounds.bottomRight[1] || ''}
                disabled
                fullWidth
              />
            </Grid>
          </>
        )}
      </Grid>
    </LocalizationProvider>
  );
}

export default NDVISummaryWidgetConfig;
