import React, { useEffect } from 'react';
import { 
  Grid, FormControl, InputLabel, Select, MenuItem, 
  Button, TextField, Typography
} from '@mui/material';

function HybridChartWidgetConfig({ 
  widget, 
  index, 
  handleWidgetChange, 
  chartConfigurations, 
  locations, 
  setIsChartDesignerOpen, 
  setIsLocationSetupOpen 
}) {
  useEffect(() => {
    console.log("Received chart configurations:", chartConfigurations);
  }, [chartConfigurations]);

  const selectedChart = chartConfigurations.find(chart => chart.id === widget.config.chartConfigId);

  const handleChartConfigChange = (e) => {
    const selectedChartId = e.target.value;
    handleWidgetChange(index, 'config.chartConfigId', selectedChartId);
    
    const selectedChart = chartConfigurations.find(chart => chart.id === selectedChartId);
    if (selectedChart && selectedChart.refreshInterval) {
      handleWidgetChange(index, 'config.refreshInterval', selectedChart.refreshInterval);
    }

    // Initialize locationOverrides when a new chart is selected
    if (selectedChart && selectedChart.config && selectedChart.config.dataSeries) {
      const locationOverrides = selectedChart.config.dataSeries.map(series => ({
        seriesName: series.name,
        overrideLocationId: null
      }));
      handleWidgetChange(index, 'config.locationOverrides', locationOverrides);
    }
  };

  const handleRefreshIntervalChange = (e) => {
    handleWidgetChange(index, 'config.refreshInterval', Number(e.target.value));
  };

  const handleLocationOverrideChange = (seriesIndex, locationId) => {
    const newLocationOverrides = [...(widget.config.locationOverrides || [])];
    newLocationOverrides[seriesIndex] = {
      ...newLocationOverrides[seriesIndex],
      overrideLocationId: locationId
    };
    handleWidgetChange(index, 'config.locationOverrides', newLocationOverrides);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Chart Configuration</InputLabel>
          <Select
            value={widget.config.chartConfigId || ''}
            onChange={handleChartConfigChange}
            label="Chart Configuration"
          >
            {chartConfigurations.map((chart) => (
              <MenuItem key={chart.id} value={chart.id}>{chart.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Refresh Interval (seconds)"
          type="number"
          value={widget.config.refreshInterval || 0}
          onChange={handleRefreshIntervalChange}
        />
      </Grid>

      {selectedChart && selectedChart.config && selectedChart.config.dataSeries && (
        <Grid item xs={12}>
          <Typography variant="subtitle1">Location Overrides</Typography>
          {selectedChart.config.dataSeries.map((series, seriesIndex) => (
            <FormControl fullWidth key={seriesIndex} style={{ marginTop: '10px' }}>
              <InputLabel>{`Override Location for ${series.name}`}</InputLabel>
              <Select
                value={widget.config.locationOverrides?.[seriesIndex]?.overrideLocationId || ''}
                onChange={(e) => handleLocationOverrideChange(seriesIndex, e.target.value)}
                label={`Override Location for ${series.name}`}
              >
                <MenuItem value="">
                  <em>None (Use original location)</em>
                </MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Grid>
      )}

      <Grid item xs={6}>
        <Button 
          onClick={() => setIsChartDesignerOpen(true)} 
          variant="outlined" 
          color="primary"
          fullWidth
        >
          Design New Chart
        </Button>
      </Grid>
      <Grid item xs={6}>
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

export default HybridChartWidgetConfig;